"use client";

import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { enUS, ru } from "date-fns/locale";
import { useEffect, useMemo, useState } from "react";

type BookingCalendarProps = {
  locale: "ru" | "en";
  minStay: number;
  blockedDays: string[];
  onRangeChange?: (checkIn: string | null, checkOut: string | null) => void;
  labels: {
    checkIn: string;
    checkOut: string;
    nights: string;
    selectCheckIn: string;
    selectCheckOut: string;
    unavailable: string;
    legendAvailable: string;
    legendBusy: string;
    legendSelected: string;
    prevMonth: string;
    nextMonth: string;
    minStayHint: string;
  };
};

function toKey(d: Date) {
  return format(d, "yyyy-MM-dd");
}

export function BookingCalendar({
  locale,
  minStay,
  blockedDays,
  onRangeChange,
  labels,
}: BookingCalendarProps) {
  const dateLocale = locale === "ru" ? ru : enUS;
  const blocked = useMemo(() => new Set(blockedDays), [blockedDays]);
  const today = startOfDay(new Date());

  const [viewMonth, setViewMonth] = useState(() => startOfMonth(today));
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);

  useEffect(() => {
    onRangeChange?.(checkIn ? toKey(checkIn) : null, checkOut ? toKey(checkOut) : null);
  }, [checkIn, checkOut, onRangeChange]);

  const monthStart = startOfMonth(viewMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const weekDays =
    locale === "ru"
      ? ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
      : ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  function isBlocked(d: Date) {
    return blocked.has(toKey(d));
  }

  function isPast(d: Date) {
    return isBefore(d, today);
  }

  function isDisabled(d: Date) {
    return isPast(d) || isBlocked(d);
  }

  function isInRange(d: Date) {
    if (!checkIn || !checkOut) return false;
    return d >= checkIn && d < checkOut;
  }

  function handleDayClick(d: Date) {
    if (isDisabled(d)) return;

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(d);
      setCheckOut(null);
      return;
    }

    if (isBefore(d, checkIn) || isSameDay(d, checkIn)) {
      setCheckIn(d);
      setCheckOut(null);
      return;
    }

    const rangeEnd = d;
    let cursor = checkIn;
    while (isBefore(cursor, rangeEnd)) {
      if (isBlocked(cursor)) {
        setCheckIn(d);
        setCheckOut(null);
        return;
      }
      cursor = addDays(cursor, 1);
    }

    const nights = differenceInCalendarDays(rangeEnd, checkIn);
    if (nights < minStay) return;

    setCheckOut(rangeEnd);
  }

  const nights =
    checkIn && checkOut ? differenceInCalendarDays(checkOut, checkIn) : 0;

  const summary = !checkIn
    ? labels.selectCheckIn
    : !checkOut
      ? labels.selectCheckOut
      : `${format(checkIn, "d MMM", { locale: dateLocale })} → ${format(checkOut, "d MMM yyyy", { locale: dateLocale })} · ${nights} ${labels.nights}`;

  return (
    <div className="space-y-3">
      <input type="hidden" name="checkIn" value={checkIn ? toKey(checkIn) : ""} />
      <input type="hidden" name="checkOut" value={checkOut ? toKey(checkOut) : ""} />

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setViewMonth(subMonths(viewMonth, 1))}
          className="rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-sm text-[var(--text)] transition hover:bg-[var(--surface)]"
          aria-label={labels.prevMonth}
        >
          ←
        </button>
        <p className="font-[family-name:var(--font-display)] text-base capitalize text-[var(--text)]">
          {format(viewMonth, "LLLL yyyy", { locale: dateLocale })}
        </p>
        <button
          type="button"
          onClick={() => setViewMonth(addMonths(viewMonth, 1))}
          className="rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-sm text-[var(--text)] transition hover:bg-[var(--surface)]"
          aria-label={labels.nextMonth}
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center text-xs text-[var(--muted)]">
        {weekDays.map((w) => (
          <span key={w} className="py-1 font-medium">
            {w}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {days.map((d) => {
          const inMonth = isSameMonth(d, viewMonth);
          const disabled = isDisabled(d);
          const selected = isInRange(d);
          const isStart = checkIn && isSameDay(d, checkIn);
          const isEnd = checkOut && isSameDay(d, checkOut);
          const busy = isBlocked(d) && inMonth;

          return (
            <button
              key={toKey(d)}
              type="button"
              disabled={!inMonth || disabled}
              onClick={() => handleDayClick(d)}
              className={[
                "relative aspect-square rounded-lg text-sm transition duration-200",
                !inMonth && "invisible pointer-events-none",
                inMonth && disabled && "cursor-not-allowed text-[var(--muted)]/50 line-through decoration-[var(--muted)]/40",
                inMonth && !disabled && "cursor-pointer text-[var(--text)] hover:bg-[var(--surface)]",
                selected && !isStart && !isEnd && "bg-[var(--accent)]/12",
                isStart && "bg-[var(--accent)] text-[var(--background)] font-medium shadow-sm",
                isEnd && "bg-[var(--accent-secondary)] text-[var(--background)] font-medium shadow-sm",
                busy && !selected && "bg-[var(--surface)]/80",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label={format(d, "d MMMM yyyy", { locale: dateLocale })}
              aria-pressed={selected || isStart || isEnd}
            >
              {format(d, "d")}
            </button>
          );
        })}
      </div>

      <p className="text-sm text-[var(--text)]">{summary}</p>

      {checkIn && !checkOut ? (
        <p className="text-xs text-[var(--muted)]">
          {labels.minStayHint.replace("{n}", String(minStay))}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3 border-t border-[var(--border)] pt-3 text-xs text-[var(--muted)]">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-[var(--border)] bg-white" />
          {labels.legendAvailable}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-[var(--surface)] line-through" />
          {labels.legendBusy}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-[var(--accent)]" />
          {labels.legendSelected}
        </span>
      </div>
    </div>
  );
}
