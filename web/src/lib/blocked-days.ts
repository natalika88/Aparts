import {
  addDays,
  eachDayOfInterval,
  format,
  isBefore,
  startOfDay,
} from "date-fns";

export type DateRangeInput = {
  dateStart: Date;
  dateEnd: Date;
};

/** Ночи, занятые в интервале [dateStart, dateEnd) — как в проверке бронирования. */
export function expandOccupiedNights(ranges: DateRangeInput[]): string[] {
  const today = startOfDay(new Date());
  const keys = new Set<string>();

  for (const { dateStart, dateEnd } of ranges) {
    const start = startOfDay(dateStart);
    const end = startOfDay(dateEnd);
    if (!isBefore(start, end)) continue;

    const lastNight = addDays(end, -1);
    if (isBefore(lastNight, today)) continue;

    const from = isBefore(start, today) ? today : start;
    if (isBefore(lastNight, from)) continue;

    for (const day of eachDayOfInterval({ start: from, end: lastNight })) {
      keys.add(format(day, "yyyy-MM-dd"));
    }
  }

  return [...keys].sort();
}

export function serializeBlockedDays(keys: string[]): string {
  return keys.join(",");
}

export function parseBlockedDays(serialized: string): Set<string> {
  if (!serialized.trim()) return new Set();
  return new Set(serialized.split(",").filter(Boolean));
}
