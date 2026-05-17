"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import { PersonalDataNotice } from "@/components/personal-data/PersonalDataNotice";
import { submitBookingRequest, type BookingFormState } from "./actions";

const initial: BookingFormState = { ok: true };

function SubmitButton({ label, disabled }: { label: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="w-full rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[var(--background)] disabled:opacity-50"
    >
      {label}
    </button>
  );
}

export function BookingForm({
  slug,
  locale,
  minStay,
  blockedDays,
  labels,
  embedded = false,
}: {
  slug: string;
  locale: "ru" | "en";
  minStay: number;
  blockedDays: string[];
  embedded?: boolean;
  labels: {
    submit: string;
    checkIn: string;
    checkOut: string;
    guests: string;
    name: string;
    phone: string;
    email: string;
    comment: string;
    personalData: {
      title: string;
      protected: string;
      noAi: string;
      mergeOnly: string;
      consent: string;
    };
    calendar: {
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
    error: Record<string, string>;
  };
}) {
  const [state, formAction] = useActionState(submitBookingRequest, initial);
  const [datesReady, setDatesReady] = useState(false);

  return (
    <form
      action={formAction}
      className={`w-full space-y-3 ${embedded ? "mt-4" : "mt-4 rounded-2xl border border-[var(--border)] bg-white/60 p-6"}`}
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="slug" value={slug} />

      <BookingCalendar
        locale={locale}
        minStay={minStay}
        blockedDays={blockedDays}
        compact={embedded}
        labels={{
          checkIn: labels.checkIn,
          checkOut: labels.checkOut,
          nights: labels.calendar.nights,
          selectCheckIn: labels.calendar.selectCheckIn,
          selectCheckOut: labels.calendar.selectCheckOut,
          unavailable: labels.calendar.unavailable,
          legendAvailable: labels.calendar.legendAvailable,
          legendBusy: labels.calendar.legendBusy,
          legendSelected: labels.calendar.legendSelected,
          prevMonth: labels.calendar.prevMonth,
          nextMonth: labels.calendar.nextMonth,
          minStayHint: labels.calendar.minStayHint,
        }}
        onRangeChange={(checkIn, checkOut) => setDatesReady(Boolean(checkIn && checkOut))}
      />

      <label className="block text-sm">
        <span className="text-[var(--muted)]">{labels.guests}</span>
        <input
          required
          type="number"
          min={1}
          max={20}
          name="guestsCount"
          defaultValue={2}
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2"
        />
      </label>
      <PersonalDataNotice labels={labels.personalData} compact />

      <label className="block text-sm">
        <span className="text-[var(--muted)]">{labels.name}</span>
        <input required name="guestName" autoComplete="name" className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2" />
      </label>
      <label className="block text-sm">
        <span className="text-[var(--muted)]">{labels.phone}</span>
        <input required name="guestPhone" type="tel" autoComplete="tel" className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2" />
      </label>
      <label className="block text-sm">
        <span className="text-[var(--muted)]">{labels.email}</span>
        <input required type="email" name="guestEmail" autoComplete="email" className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2" />
      </label>
      <label className="flex gap-2 text-sm leading-relaxed text-[var(--muted)]">
        <input
          required
          type="checkbox"
          name="personalDataConsent"
          value="on"
          className="mt-1 h-4 w-4 shrink-0 rounded border-[var(--border)] accent-[var(--accent)]"
        />
        <span>{labels.personalData.consent}</span>
      </label>
      <label className="block text-sm">
        <span className="text-[var(--muted)]">{labels.comment}</span>
        <textarea name="comment" rows={3} className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2" />
      </label>
      {state.ok === false && state.error ? (
        <p className="text-sm text-red-700">{labels.error[state.error] ?? state.error}</p>
      ) : null}
      <SubmitButton label={labels.submit} disabled={!datesReady} />
    </form>
  );
}
