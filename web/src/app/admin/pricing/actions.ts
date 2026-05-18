"use server";

import { revalidatePath } from "next/cache";
import { addDays, format, isBefore, parseISO, startOfDay } from "date-fns";
import { ru } from "date-fns/locale";
import { z } from "zod";
import { writeAuditLog } from "@/lib/auth/audit";
import { requirePricingAccess } from "@/lib/auth/session";
import {
  bookingFieldsToPersonalBundle,
  decryptBookingPersonalFields,
} from "@/lib/personal-data/booking-storage";
import { runDocumentGenerationPipeline } from "@/lib/personal-data";
import type { DocumentType } from "@/lib/personal-data";
import { prisma } from "@/lib/prisma";

const statusSchema = z.enum(["PENDING", "CONFIRMED", "CANCELLED", "REJECTED", "COMPLETED"]);

export async function updateBookingStatus(bookingId: string, status: string) {
  const session = await requirePricingAccess();
  const nextStatus = statusSchema.parse(status);

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { property: true },
  });
  if (!booking) throw new Error("Booking not found");

  const before = { status: booking.status };

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: nextStatus },
    });

    if (nextStatus === "CONFIRMED") {
      await tx.propertyAvailability.deleteMany({
        where: { bookingId, propertyId: booking.propertyId },
      });
      await tx.propertyAvailability.create({
        data: {
          propertyId: booking.propertyId,
          dateStart: booking.dateCheckIn,
          dateEnd: booking.dateCheckOut,
          status: "BOOKED",
          source: "BOOKING",
          bookingId: booking.id,
          comment: "Подтверждённая бронь",
        },
      });
    }

    if (before.status === "CONFIRMED" && nextStatus !== "CONFIRMED") {
      await tx.propertyAvailability.deleteMany({
        where: { bookingId: booking.id },
      });
    }
  });

  await writeAuditLog({
    userId: session.user.id,
    entityType: "Booking",
    entityId: bookingId,
    action: "STATUS_UPDATE",
    before,
    after: { status: nextStatus },
  });

  revalidatePath("/admin/pricing/bookings");
  revalidatePath(`/admin/pricing/bookings/${bookingId}`);
}

export async function generateBookingDocument(bookingId: string, type: DocumentType) {
  const session = await requirePricingAccess();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { property: { include: { group: true } } },
  });
  if (!booking) throw new Error("Booking not found");

  const guest = decryptBookingPersonalFields({
    guestName: booking.guestName,
    guestPhone: booking.guestPhone,
    guestEmail: booking.guestEmail,
  });
  const personalData = bookingFieldsToPersonalBundle({
    guestName: guest.guestName,
    guestPhone: guest.guestPhone,
    guestEmail: guest.guestEmail,
  });

  const result = await runDocumentGenerationPipeline(
    type,
    {
      locale: "ru",
      propertyName: booking.property.publicName,
      propertyCode: booking.property.internalCode,
      address: booking.property.fullAddress,
      checkIn: format(booking.dateCheckIn, "d MMMM yyyy", { locale: ru }),
      checkOut: format(booking.dateCheckOut, "d MMMM yyyy", { locale: ru }),
      nights: booking.nightsCount,
      guests: booking.guestsCount,
      totalPrice: booking.totalPrice,
      notes: booking.comment ?? undefined,
    },
    personalData,
  );

  const log = await prisma.documentGeneration.create({
    data: {
      documentType: type === "brief" ? "BRIEF" : "COMMERCIAL_PROPOSAL",
      status: "COMPLETED",
      contextJson: JSON.stringify({ bookingId }),
      piiEncrypted: result.piiEncrypted,
      aiOutput: result.aiBody,
      finalOutput: result.finalBody,
      aiProvider: result.provider,
      piiSentToAi: false,
      bookingId: booking.id,
    },
  });

  await writeAuditLog({
    userId: session.user.id,
    entityType: "DocumentGeneration",
    entityId: log.id,
    action: "CREATE",
    after: { type, bookingId, provider: result.provider },
  });

  revalidatePath(`/admin/pricing/bookings/${bookingId}`);
  return { id: log.id, body: result.finalBody, provider: result.provider };
}

export async function updatePropertyPrice(
  propertyId: string,
  data: { basePricePerNight: number; minStayDefault: number },
) {
  const session = await requirePricingAccess();
  const before = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!before) throw new Error("Property not found");

  await prisma.property.update({
    where: { id: propertyId },
    data: {
      basePricePerNight: data.basePricePerNight,
      minStayDefault: data.minStayDefault,
    },
  });

  await writeAuditLog({
    userId: session.user.id,
    entityType: "Property",
    entityId: propertyId,
    action: "PRICE_UPDATE",
    before: { basePricePerNight: before.basePricePerNight, minStayDefault: before.minStayDefault },
    after: data,
  });

  revalidatePath("/admin/pricing/properties");
  revalidatePath(`/admin/pricing/properties/${propertyId}`);
}

export async function blockPropertyDates(
  propertyId: string,
  dateStart: string,
  dateEnd: string,
  status: "BLOCKED" | "UNAVAILABLE",
) {
  const session = await requirePricingAccess();
  const start = new Date(dateStart);
  const end = new Date(dateEnd);
  if (end <= start) throw new Error("Invalid date range");

  const row = await prisma.propertyAvailability.create({
    data: {
      propertyId,
      dateStart: start,
      dateEnd: end,
      status,
      source: "MANUAL",
      comment: "Из панели цен",
    },
  });

  await writeAuditLog({
    userId: session.user.id,
    entityType: "PropertyAvailability",
    entityId: row.id,
    action: "CREATE",
    after: { propertyId, dateStart, dateEnd, status },
  });

  revalidatePath(`/admin/pricing/properties/${propertyId}`);
}

const calendarStatusSchema = z.enum(["BLOCKED", "UNAVAILABLE", "AVAILABLE"]);

/** Первая ночь (включительно) и день выезда (исключительно), как в бронировании. */
export async function applyCalendarRange(
  propertyId: string,
  dateStart: string,
  dateEnd: string,
  status: z.infer<typeof calendarStatusSchema>,
) {
  const session = await requirePricingAccess();
  const parsedStatus = calendarStatusSchema.parse(status);
  const start = startOfDay(parseISO(dateStart));
  const end = startOfDay(parseISO(dateEnd));
  if (!isBefore(start, end)) throw new Error("Некорректный диапазон дат");

  const booked = await prisma.propertyAvailability.findFirst({
    where: {
      propertyId,
      status: "BOOKED",
      dateStart: { lt: end },
      dateEnd: { gt: start },
    },
  });
  const confirmedBooking = await prisma.booking.findFirst({
    where: {
      propertyId,
      status: "CONFIRMED",
      dateCheckIn: { lt: end },
      dateCheckOut: { gt: start },
    },
  });
  if (booked || confirmedBooking) {
    throw new Error("В выбранном диапазоне есть подтверждённая бронь — измените другие даты");
  }

  await prisma.propertyAvailability.deleteMany({
    where: {
      propertyId,
      source: "MANUAL",
      status: { in: ["BLOCKED", "UNAVAILABLE"] },
      dateStart: { lt: end },
      dateEnd: { gt: start },
    },
  });

  if (parsedStatus !== "AVAILABLE") {
    await prisma.propertyAvailability.create({
      data: {
        propertyId,
        dateStart: start,
        dateEnd: end,
        status: parsedStatus,
        source: "MANUAL",
        comment: "Календарь админки",
      },
    });
  }

  await writeAuditLog({
    userId: session.user.id,
    entityType: "Property",
    entityId: propertyId,
    action: "CALENDAR_UPDATE",
    after: { dateStart, dateEnd, status: parsedStatus },
  });

  revalidatePath(`/admin/pricing/properties/${propertyId}`);
}

export async function deleteAvailabilityRecord(recordId: string, propertyId: string) {
  const session = await requirePricingAccess();
  const row = await prisma.propertyAvailability.findUnique({ where: { id: recordId } });
  if (!row || row.propertyId !== propertyId) throw new Error("Not found");
  if (row.source !== "MANUAL" || row.status === "BOOKED") {
    throw new Error("Можно удалить только ручную блокировку");
  }

  await prisma.propertyAvailability.delete({ where: { id: recordId } });

  await writeAuditLog({
    userId: session.user.id,
    entityType: "PropertyAvailability",
    entityId: recordId,
    action: "DELETE",
  });

  revalidatePath(`/admin/pricing/properties/${propertyId}`);
}
