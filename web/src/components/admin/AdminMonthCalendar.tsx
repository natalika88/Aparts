"use client";

import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ru } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import type { AdminDayStatus } from "@/lib/admin/property-calendar";
import { applyCalendarRange } from "@/app/admin/pricing/actions";

type CalendarApplyStatus = "BLOCKED" | "UNAVAILABLE" | "AVAILABLE";

function toKey(d: Date) {
  return format(d, "yyyy-MM-dd");
}

const STATUS_STYLES: Record<AdminDayStatus, string> = {
  available: "bg-white hover:bg-emerald-50 text-slate-800",
  booked: "bg-rose-100 text-rose-800 line-through cursor-not-allowed",
  blocked: "bg-slate-300 text-slate-800",
  unavailable: "bg-amber-100 text-amber-900",
  pending: "bg-sky-100 text-sky-900",
  past: "bg-slate-50 text-slate-400",
};

export function AdminMonthCalendar({
  propertyId,
  initialMonth,
  dayStatuses,
}: {
  propertyId: string;
  initialMonth: string;
  dayStatuses: Record<string, AdminDayStatus>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(parseISO(`${initialMonth}-01`)));
  const [applyStatus, setApplyStatus] = useState<CalendarApplyStatus>("BLOCKED");
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setViewMonth(startOfMonth(parseISO(`${initialMonth}-01`)));
    setRangeStart(null);
  }, [initialMonth]);

  function goMonth(next: Date) {
    const m = format(startOfMonth(next), "yyyy-MM");
    router.push(`/admin/pricing/properties/${propertyId}?month=${m}`);
  }

  const monthStart = startOfMonth(viewMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  const summary = useMemo(() => {
    if (!rangeStart) return "Выберите первую ночь, затем день выезда (как в бронировании)";
    return `Заезд: ${format(rangeStart, "d MMM", { locale: ru })} — выберите дату выезда`;
  }, [rangeStart]);

  function statusFor(d: Date): AdminDayStatus {
    if (!isSameMonth(d, viewMonth)) return "past";
    return dayStatuses[toKey(d)] ?? "available";
  }

  function applyRange(checkIn: Date, checkOut: Date) {
    startTransition(async () => {
      setError(null);
      try {
        await applyCalendarRange(propertyId, toKey(checkIn), toKey(checkOut), applyStatus);
        setRangeStart(null);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка");
      }
    });
  }

  function handleDayClick(d: Date) {
    if (!isSameMonth(d, viewMonth)) return;
    if (statusFor(d) === "booked") return;

    if (!rangeStart) {
      setRangeStart(d);
      return;
    }

    if (isSameDay(d, rangeStart) || isBefore(d, rangeStart)) {
      setRangeStart(d);
      return;
    }

    let cursor = rangeStart;
    while (isBefore(cursor, d)) {
      if (statusFor(cursor) === "booked") {
        setError("В диапазоне есть подтверждённая бронь");
        setRangeStart(null);
        return;
      }
      cursor = addDays(cursor, 1);
    }

    applyRange(rangeStart, d);
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-medium text-slate-900">Календарь на месяц</h2>
          <p className="mt-1 text-sm text-slate-500">{summary}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-slate-500">Применить:</span>
          {(
            [
              ["BLOCKED", "Закрыть"],
              ["UNAVAILABLE", "Недоступно"],
              ["AVAILABLE", "Открыть"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setApplyStatus(value)}
              className={`rounded-lg px-3 py-1.5 ${
                applyStatus === value ? "bg-slate-900 text-white" : "border border-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          disabled={pending}
          onClick={() => goMonth(subMonths(viewMonth, 1))}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
        >
          ←
        </button>
        <p className="font-medium capitalize text-slate-900">
          {format(viewMonth, "LLLL yyyy", { locale: ru })}
        </p>
        <button
          type="button"
          disabled={pending}
          onClick={() => goMonth(addMonths(viewMonth, 1))}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
        >
          →
        </button>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-0.5 text-center text-xs text-slate-500">
        {weekDays.map((w) => (
          <span key={w} className="py-1 font-medium">
            {w}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {days.map((d) => {
          const inMonth = isSameMonth(d, viewMonth);
          const st = statusFor(d);
          const isStart = rangeStart && isSameDay(d, rangeStart);
          return (
            <button
              key={toKey(d)}
              type="button"
              disabled={!inMonth || pending || st === "booked"}
              onClick={() => handleDayClick(d)}
              className={[
                "aspect-square rounded-md text-sm transition",
                !inMonth && "invisible pointer-events-none",
                inMonth && STATUS_STYLES[st],
                isStart && "ring-2 ring-slate-900 ring-offset-1",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {format(d, "d")}
            </button>
          );
        })}
      </div>

      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      {pending ? <p className="mt-2 text-sm text-slate-500">Сохранение…</p> : null}

      <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-3 text-xs text-slate-600">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-white border" /> Свободно
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-rose-100" /> Забронировано
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-sky-100" /> Заявка
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-slate-300" /> Закрыто
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-amber-100" /> Недоступно
        </span>
      </div>
    </section>
  );
}