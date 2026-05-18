import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  isBefore,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { prisma } from "@/lib/prisma";

export type AdminDayStatus =
  | "available"
  | "booked"
  | "blocked"
  | "unavailable"
  | "pending"
  | "past";

export type MonthCalendarData = {
  monthKey: string;
  days: Record<string, AdminDayStatus>;
};

function toKey(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function nightInRange(night: Date, start: Date, end: Date) {
  const n = startOfDay(night);
  const s = startOfDay(start);
  const e = startOfDay(end);
  return !isBefore(n, s) && isBefore(n, e);
}

export async function getPropertyMonthCalendar(
  propertyId: string,
  month: Date,
): Promise<MonthCalendarData> {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const today = startOfDay(new Date());

  const [availability, bookings] = await Promise.all([
    prisma.propertyAvailability.findMany({
      where: {
        propertyId,
        dateStart: { lt: addDays(monthEnd, 1) },
        dateEnd: { gt: monthStart },
      },
    }),
    prisma.booking.findMany({
      where: {
        propertyId,
        dateCheckIn: { lt: addDays(monthEnd, 1) },
        dateCheckOut: { gt: monthStart },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    }),
  ]);

  const days: Record<string, AdminDayStatus> = {};
  for (const d of eachDayOfInterval({ start: monthStart, end: monthEnd })) {
    const key = toKey(d);
    if (isBefore(d, today)) {
      days[key] = "past";
    } else {
      days[key] = "available";
    }
  }

  for (const a of availability) {
    for (const d of eachDayOfInterval({ start: monthStart, end: monthEnd })) {
      if (!nightInRange(d, a.dateStart, a.dateEnd)) continue;
      const key = toKey(d);
      if (a.status === "BOOKED") days[key] = "booked";
      else if (a.status === "BLOCKED") days[key] = "blocked";
      else if (a.status === "UNAVAILABLE") days[key] = "unavailable";
    }
  }

  for (const b of bookings) {
    for (const d of eachDayOfInterval({ start: monthStart, end: monthEnd })) {
      if (!nightInRange(d, b.dateCheckIn, b.dateCheckOut)) continue;
      const key = toKey(d);
      if (b.status === "CONFIRMED") days[key] = "booked";
      else if (b.status === "PENDING" && days[key] !== "booked") days[key] = "pending";
    }
  }

  return { monthKey: format(monthStart, "yyyy-MM"), days };
}
