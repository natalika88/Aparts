import Link from "next/link";
import { parseISO, startOfMonth } from "date-fns";
import { notFound } from "next/navigation";
import { AdminMonthCalendar } from "@/components/admin/AdminMonthCalendar";
import { AvailabilityRecordRow } from "@/components/admin/AvailabilityRecordRow";
import { getPropertyMonthCalendar } from "@/lib/admin/property-calendar";
import { prisma } from "@/lib/prisma";
import { PropertyPricingForm } from "./PropertyPricingForm";

export default async function PricingPropertyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ month?: string }>;
}) {
  const { id } = await params;
  const { month: monthParam } = await searchParams;
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      group: true,
      availability: { orderBy: { dateStart: "desc" }, take: 24 },
    },
  });
  if (!property) notFound();

  const viewMonth = monthParam?.match(/^\d{4}-\d{2}$/)
    ? startOfMonth(parseISO(`${monthParam}-01`))
    : startOfMonth(new Date());
  const calendar = await getPropertyMonthCalendar(property.id, viewMonth);

  return (
    <div className="space-y-6">
      <Link href="/admin/pricing/properties" className="text-sm text-slate-600 underline">
        ← Объекты
      </Link>
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-xl text-slate-900">{property.publicName}</h1>
        <p className="text-sm text-slate-500">
          {property.internalCode} · {property.group.name}
        </p>
      </div>

      <PropertyPricingForm
        propertyId={property.id}
        basePrice={property.basePricePerNight ?? 0}
        minStay={property.minStayDefault}
      />

      <AdminMonthCalendar
        propertyId={property.id}
        initialMonth={calendar.monthKey}
        dayStatuses={calendar.days}
      />

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-medium text-slate-900">Записи календаря</h2>
        <ul className="mt-3 divide-y divide-slate-100 text-sm">
          {property.availability.map((a) => (
            <AvailabilityRecordRow
              key={a.id}
              id={a.id}
              propertyId={property.id}
              dateStart={a.dateStart}
              dateEnd={a.dateEnd}
              status={a.status}
              canDelete={a.source === "MANUAL" && a.status !== "BOOKED"}
            />
          ))}
          {property.availability.length === 0 ? (
            <li className="py-4 text-slate-500">Нет ручных блокировок</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
