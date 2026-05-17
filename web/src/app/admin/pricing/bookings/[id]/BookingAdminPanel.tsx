"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { generateBookingDocument, updateBookingStatus } from "../../actions";

export function BookingAdminPanel({
  bookingId,
  currentStatus,
}: {
  bookingId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [docBody, setDocBody] = useState<string | null>(null);
  const [docMeta, setDocMeta] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function setStatus(status: string) {
    startTransition(async () => {
      setError(null);
      try {
        await updateBookingStatus(bookingId, status);
        router.refresh();
      } catch {
        setError("Не удалось обновить статус");
      }
    });
  }

  function generate(type: "brief" | "commercial_proposal") {
    startTransition(async () => {
      setError(null);
      try {
        const res = await generateBookingDocument(bookingId, type);
        setDocBody(res.body);
        setDocMeta(`Провайдер: ${res.provider} · ПДн не передавались в ИИ`);
        router.refresh();
      } catch {
        setError("Ошибка генерации документа");
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-medium text-slate-900">Статус заявки</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            ["CONFIRMED", "Подтвердить"],
            ["REJECTED", "Отклонить"],
            ["CANCELLED", "Отменить"],
            ["COMPLETED", "Завершить"],
          ].map(([status, label]) => (
            <button
              key={status}
              type="button"
              disabled={pending || currentStatus === status}
              onClick={() => setStatus(status)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-40"
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5">
        <h2 className="font-medium text-slate-900">Бриф и коммерческое предложение</h2>
        <p className="mt-1 text-sm text-slate-600">
          ИИ получает только объект, даты и условия. ФИО и контакты подставляются на сервере после генерации.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => generate("brief")}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            Сформировать бриф
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => generate("commercial_proposal")}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm disabled:opacity-50"
          >
            Сформировать КП
          </button>
        </div>
        {docMeta ? <p className="mt-2 text-xs text-emerald-800">{docMeta}</p> : null}
        {docBody ? (
          <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-800">
            {docBody}
          </pre>
        ) : null}
      </section>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
