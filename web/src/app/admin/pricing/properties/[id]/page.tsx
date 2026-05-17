import Link from "next/link";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PropertyPricingForm } from "./PropertyPricingForm";

export default async function PricingPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      group: true,
      availability: { orderBy: { dateStart: "desc" }, take: 12 },
    },
  });
  if (!property) notFound();

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

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-medium text-slate-900">Записи календаря</h2>
        <ul className="mt-3 divide-y divide-slate-100 text-sm">
          {property.availability.map((a) => (
            <li key={a.id} className="flex justify-between py-2">
              <span>
                {format(a.dateStart, "dd.MM.yyyy")} — {format(a.dateEnd, "dd.MM.yyyy")}
              </span>
              <span className="rounded-full bg-slate-100 px-2 text-xs">{a.status}</span>
            </li>
          ))}
          {property.availability.length === 0 ? (
            <li className="py-4 text-slate-500">Нет ручных блокировок</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
