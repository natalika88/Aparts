"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { blockPropertyDates, updatePropertyPrice } from "../../actions";

export function PropertyPricingForm({
  propertyId,
  basePrice,
  minStay,
}: {
  propertyId: string;
  basePrice: number;
  minStay: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        className="rounded-xl border border-slate-200 bg-white p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            await updatePropertyPrice(propertyId, {
              basePricePerNight: Number(fd.get("price")),
              minStayDefault: Number(fd.get("minStay")),
            });
            router.refresh();
          });
        }}
      >
        <h2 className="font-medium text-slate-900">Базовая цена</h2>
        <label className="mt-3 block text-sm">
          <span className="text-slate-500">₽ / ночь</span>
          <input
            name="price"
            type="number"
            min={0}
            defaultValue={basePrice}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="mt-3 block text-sm">
          <span className="text-slate-500">Мин. ночей</span>
          <input
            name="minStay"
            type="number"
            min={1}
            defaultValue={minStay}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          Сохранить
        </button>
      </form>

      <form
        className="rounded-xl border border-slate-200 bg-white p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            await blockPropertyDates(
              propertyId,
              String(fd.get("dateStart")),
              String(fd.get("dateEnd")),
              fd.get("status") as "BLOCKED" | "UNAVAILABLE",
            );
            router.refresh();
          });
        }}
      >
        <h2 className="font-medium text-slate-900">Закрыть даты</h2>
        <label className="mt-3 block text-sm">
          <span className="text-slate-500">С</span>
          <input name="dateStart" type="date" required className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="mt-3 block text-sm">
          <span className="text-slate-500">По</span>
          <input name="dateEnd" type="date" required className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="mt-3 block text-sm">
          <span className="text-slate-500">Статус</span>
          <select name="status" className="mt-1 w-full rounded-lg border px-3 py-2">
            <option value="BLOCKED">Заблокировано</option>
            <option value="UNAVAILABLE">Недоступно</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={pending}
          className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-50"
        >
          Применить
        </button>
      </form>
    </div>
  );
}
