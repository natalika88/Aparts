import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { PropertyCoverImage } from "@/components/PropertyImages";

export async function generateMetadata() {
  const t = await getTranslations("meta");
  return { title: t("title"), description: t("description") };
}

export default async function HomePage() {
  const t = await getTranslations("Home");
  const n = await getTranslations("Naming");
  const apt = await getTranslations("Apartments");
  const groups = await prisma.propertyGroup.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { properties: true } },
    },
  });

  const featured = await prisma.property.findMany({
    where: { status: "PUBLISHED", isFeatured: true },
    take: 4,
    include: {
      group: true,
      media: {
        where: { mediaType: "image" },
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
  });

  return (
    <div className="space-y-16">
      <section className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">{t("heroSubtitle")}</p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl leading-tight text-[var(--text)] md:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="max-w-xl text-lg text-[var(--muted)]">{t("heroLead")}</p>
          <p className="text-sm text-[var(--muted)]">{n("hint")}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/apartments"
              className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium tracking-wide text-[var(--background)] font-[family-name:var(--font-display)] hover:opacity-90"
            >
              {t("ctaTitle")}
            </Link>
            <Link
              href="/addresses"
              className="rounded-full border border-[var(--border)] px-6 py-3 text-sm font-[family-name:var(--font-display)] tracking-wide text-[var(--text)] hover:bg-[var(--surface)]"
            >
              {t("groupsTitle")}
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)]/50 p-8 shadow-sm">
          <p className="font-[family-name:var(--font-display)] text-xl text-[var(--text)]">{t("ctaBody")}</p>
          <p className="mt-4 text-sm text-[var(--muted)]">{t("bookingNote")}</p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--text)]">{t("groupsTitle")}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((g) => (
            <Link
              key={g.id}
              href={`/addresses/${g.slug}`}
              className="group rounded-2xl border border-[var(--border)] bg-white/40 p-6 transition hover:border-[var(--accent-secondary)]"
            >
              <h3 className="font-[family-name:var(--font-display)] text-lg text-[var(--text)] group-hover:text-[var(--accent)]">
                {g.name}
              </h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{g.shortDescription}</p>
              <p className="mt-4 text-xs text-[var(--muted)]">
                {g._count.properties}{" "}
                <span className="lowercase">апартаментов</span>
              </p>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 ? (
        <section className="space-y-6">
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--text)]">{t("featuredTitle")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {featured.map((p) => (
              <Link
                key={p.id}
                href={`/apartments/${p.slug}`}
                className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white/50 hover:border-[var(--accent)]"
              >
                <PropertyCoverImage
                  src={p.media[0]?.filePath}
                  alt={p.publicName}
                  className="aspect-[16/10] w-full"
                />
                <div className="p-6">
                <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{p.internalCode}</p>
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-lg text-[var(--text)]">{p.publicName}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{p.group.name}</p>
                {p.basePricePerNight ? (
                  <p className="mt-4 text-sm text-[var(--text)]">
                    {apt("from")} {p.basePricePerNight} {apt("perNight")}
                  </p>
                ) : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
