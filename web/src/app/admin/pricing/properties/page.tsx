import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function PricingPropertiesPage() {
  const properties = await prisma.property.findMany({
    orderBy: [{ group: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    include: { group: { select: { name: true } } },
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="border-b border-slate-100 bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Код</th>
            <th className="px-4 py-3 font-medium">Название</th>
            <th className="px-4 py-3 font-medium">Адрес</th>
            <th className="px-4 py-3 font-medium">Цена от</th>
            <th className="px-4 py-3 font-medium">Min stay</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {properties.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50/80">
              <td className="px-4 py-3 font-mono text-xs">{p.internalCode}</td>
              <td className="px-4 py-3 font-medium">{p.publicName}</td>
              <td className="px-4 py-3 text-slate-600">{p.group.name}</td>
              <td className="px-4 py-3">{p.basePricePerNight?.toLocaleString("ru-RU") ?? "—"} ₽</td>
              <td className="px-4 py-3">{p.minStayDefault}</td>
              <td className="px-4 py-3 text-right">
                <Link href={`/admin/pricing/properties/${p.id}`} className="underline">
                  Цены и календарь
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
