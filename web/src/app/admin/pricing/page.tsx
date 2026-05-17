import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function PricingDashboardPage() {
  const [pendingCount, propertiesCount, recentBookings] = await Promise.all([
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.property.count({ where: { status: "PUBLISHED" } }),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { property: { select: { publicName: true, internalCode: true } } },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Новые заявки</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{pendingCount}</p>
          <Link href="/admin/pricing/bookings?status=PENDING" className="mt-2 inline-block text-sm text-slate-700 underline">
            Открыть →
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Опубликовано объектов</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{propertiesCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Панель</p>
          <p className="mt-1 text-sm text-slate-700">
            Подтверждение брони блокирует даты в календаре. ПДн гостей расшифровываются только здесь.
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white">
        <h2 className="border-b border-slate-100 px-5 py-4 font-medium text-slate-900">Последние заявки</h2>
        <ul className="divide-y divide-slate-100">
          {recentBookings.map((b) => (
            <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
              <span>
                {b.property.publicName}{" "}
                <span className="text-slate-400">({b.property.internalCode})</span>
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{b.status}</span>
              <Link href={`/admin/pricing/bookings/${b.id}`} className="text-slate-700 underline">
                Открыть
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
