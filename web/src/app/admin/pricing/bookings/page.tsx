import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Ожидает",
  CONFIRMED: "Подтверждена",
  CANCELLED: "Отменена",
  REJECTED: "Отклонена",
  COMPLETED: "Завершена",
};

export default async function PricingBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const bookings = await prisma.booking.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      property: { select: { publicName: true, internalCode: true, slug: true } },
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {["", "PENDING", "CONFIRMED", "REJECTED", "CANCELLED"].map((s) => (
          <Link
            key={s || "all"}
            href={s ? `/admin/pricing/bookings?status=${s}` : "/admin/pricing/bookings"}
            className={`rounded-full px-3 py-1 text-sm ${
              (status ?? "") === s ? "bg-slate-900 text-white" : "bg-white border border-slate-200"
            }`}
          >
            {s ? STATUS_LABELS[s] : "Все"}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Объект</th>
              <th className="px-4 py-3 font-medium">Даты</th>
              <th className="px-4 py-3 font-medium">Сумма</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium">Создана</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3">
                  <span className="font-medium text-slate-900">{b.property.publicName}</span>
                  <span className="ml-1 text-slate-400">{b.property.internalCode}</span>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {format(b.dateCheckIn, "dd.MM.yy")} — {format(b.dateCheckOut, "dd.MM.yy")}
                </td>
                <td className="px-4 py-3">{b.totalPrice.toLocaleString("ru-RU")} ₽</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                    {STATUS_LABELS[b.status] ?? b.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{format(b.createdAt, "dd.MM.yyyy HH:mm")}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/pricing/bookings/${b.id}`} className="text-slate-800 underline">
                    Детали
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 ? (
          <p className="px-4 py-8 text-center text-slate-500">Заявок нет</p>
        ) : null}
      </div>
    </div>
  );
}
