import { prisma } from "@/lib/prisma";
import { expandOccupiedNights } from "@/lib/blocked-days";

/** Занятые ночи объекта: блокировки + активные брони. */
export async function getPropertyBlockedDays(propertyId: string): Promise<string[]> {
  const now = new Date();

  const [availability, bookings] = await Promise.all([
    prisma.propertyAvailability.findMany({
      where: {
        propertyId,
        status: { in: ["BOOKED", "BLOCKED", "UNAVAILABLE"] },
        dateEnd: { gt: now },
      },
      select: { dateStart: true, dateEnd: true },
    }),
    prisma.booking.findMany({
      where: {
        propertyId,
        status: { in: ["PENDING", "CONFIRMED"] },
        dateCheckOut: { gt: now },
      },
      select: { dateCheckIn: true, dateCheckOut: true },
    }),
  ]);

  return expandOccupiedNights([
    ...availability.map((a) => ({ dateStart: a.dateStart, dateEnd: a.dateEnd })),
    ...bookings.map((b) => ({ dateStart: b.dateCheckIn, dateEnd: b.dateCheckOut })),
  ]);
}
