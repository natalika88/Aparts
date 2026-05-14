"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitBookingRequest, type BookingFormState } from "./actions";

const initial: BookingFormState = { ok: true };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[var(--background)] disabled:opacity-50"
    >
      {label}
    </button>
  );
}

export function BookingForm({
  slug,
  locale,
  minStay,
  labels,
}: {
  slug: string;
  locale: "ru" | "en";
  minStay: number;
  labels: {
    submit: string;
    checkIn: string;
    checkOut: string;
    guests: string;
    name: string;
    phone: string;
    email: string;
    comment: string;
    error: Record<string, string>;
  };
}) {
  const [state, formAction] = useActionState(submitBookingRequest, initial);

  return (
    <form action={formAction} className="mt-6 space-y-4 rounded-2xl border border-[var(--border)] bg-white/60 p-6">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="slug" value={slug} />
      <p className="text-xs text-[var(--muted)]">
        min stay: {minStay} {locale === "ru" ? "ноч." : "nights"}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="text-[var(--muted)]">{labels.checkIn}</span>
          <input required type="date" name="checkIn" className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--muted)]">{labels.checkOut}</span>
          <input required type="date" name="checkOut" className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2" />
        </label>
      </div>
      <label className="block text-sm">
        <span className="text-[var(--muted)]">{labels.guests}</span>
        <input required type="number" min={1} max={20} name="guestsCount" defaultValue={2} className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2" />
      </label>
      <label className="block text-sm">
        <span className="text-[var(--muted)]">{labels.name}</span>
        <input required name="guestName" className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2" />
      </label>
      <label className="block text-sm">
        <span className="text-[var(--muted)]">{labels.phone}</span>
        <input required name="guestPhone" className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2" />
      </label>
      <label className="block text-sm">
        <span className="text-[var(--muted)]">{labels.email}</span>
        <input required type="email" name="guestEmail" className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2" />
      </label>
      <label className="block text-sm">
        <span className="text-[var(--muted)]">{labels.comment}</span>
        <textarea name="comment" rows={3} className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2" />
      </label>
      {state.ok === false && state.error ? (
        <p className="text-sm text-red-700">{labels.error[state.error] ?? state.error}</p>
      ) : null}
      <SubmitButton label={labels.submit} />
    </form>
  );
}
