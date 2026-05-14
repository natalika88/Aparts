"use server";

import { differenceInCalendarDays } from "date-fns";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const schema = z.object({
  locale: z.enum(["ru", "en"]),
  slug: z.string().min(1),
  checkIn: z.string().min(1),
  checkOut: z.string().min(1),
  guestsCount: z.coerce.number().int().min(1).max(20),
  guestName: z.string().min(2).max(120),
  guestPhone: z.string().min(5).max(40),
  guestEmail: z.string().email().max(120),
  comment: z.string().max(2000).optional(),
});

export type BookingFormState = { ok: boolean; error?: string };

export async function submitBookingRequest(
  _prev: BookingFormState | undefined,
  formData: FormData,
): Promise<BookingFormState> {
  const parsed = schema.safeParse({
    locale: formData.get("locale"),
    slug: formData.get("slug"),
    checkIn: formData.get("checkIn"),
    checkOut: formData.get("checkOut"),
    guestsCount: formData.get("guestsCount"),
    guestName: formData.get("guestName"),
    guestPhone: formData.get("guestPhone"),
    guestEmail: formData.get("guestEmail"),
    comment: formData.get("comment") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: "validation" };
  }

  const v = parsed.data;
  const property = await prisma.property.findFirst({
    where: { slug: v.slug, status: "PUBLISHED" },
  });
  if (!property) return { ok: false, error: "not_found" };

  const checkIn = new Date(v.checkIn);
  const checkOut = new Date(v.checkOut);
  if (checkOut <= checkIn) return { ok: false, error: "dates" };

  const nights = differenceInCalendarDays(checkOut, checkIn);
  if (nights < property.minStayDefault) {
    return { ok: false, error: "min_stay" };
  }

  const blocked = await prisma.propertyAvailability.findFirst({
    where: {
      propertyId: property.id,
      status: { in: ["BOOKED", "BLOCKED", "UNAVAILABLE"] },
      AND: [{ dateStart: { lt: checkOut } }, { dateEnd: { gt: checkIn } }],
    },
  });
  if (blocked) return { ok: false, error: "unavailable" };

  const pricePerNight = property.basePricePerNight ?? 0;
  const total = pricePerNight * nights;

  await prisma.booking.create({
    data: {
      propertyId: property.id,
      dateCheckIn: checkIn,
      dateCheckOut: checkOut,
      nightsCount: nights,
      guestsCount: v.guestsCount,
      guestName: v.guestName,
      guestPhone: v.guestPhone,
      guestEmail: v.guestEmail,
      comment: v.comment ?? null,
      totalPrice: total,
      status: "PENDING",
      paymentStatus: "NOT_REQUIRED",
      source: "website",
    },
  });

  redirect(v.locale === "en" ? "/en/booking-success" : "/booking-success");
}
