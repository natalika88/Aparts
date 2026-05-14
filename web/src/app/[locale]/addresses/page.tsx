import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";

export default async function AddressesPage() {
  const t = await getTranslations("Addresses");
  const groups = await prisma.propertyGroup.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { properties: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--text)]">{t("title")}</h1>
        <p className="mt-2 text-[var(--muted)]">{t("subtitle")}</p>
      </div>
      <ul className="grid gap-4 md:grid-cols-2">
        {groups.map((g) => (
          <li key={g.id}>
            <Link
              href={`/addresses/${g.slug}`}
              className="block rounded-2xl border border-[var(--border)] bg-white/50 p-6 hover:border-[var(--accent-secondary)]"
            >
              <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--text)]">{g.name}</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">{g.fullAddress}</p>
              <p className="mt-4 text-xs text-[var(--muted)]">{g._count.properties} объектов</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
