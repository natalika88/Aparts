import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/motion/Reveal";
import { YandexMapWithLabels } from "@/components/YandexMapWithLabels";
import { prisma } from "@/lib/prisma";
import { buildYandexMapWidgetUrl, groupToMapPoint } from "@/lib/yandex-map";

type Props = { params: Promise<{ locale: string }> };

export default async function AddressesPage({ params }: Props) {
  const { locale } = await params;
  const loc = locale === "en" ? "en" : "ru";
  const t = await getTranslations("Addresses");
  const groups = await prisma.propertyGroup.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { properties: true } } },
  });

  const mapPoints = groups
    .map((g) => groupToMapPoint(g))
    .filter((p): p is NonNullable<typeof p> => p !== null);
  const mapSrc = buildYandexMapWidgetUrl(mapPoints, 12);

  return (
    <div className="space-y-8">
      <Reveal immediate>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--text)]">{t("title")}</h1>
        <p className="mt-2 text-[var(--muted)]">{t("subtitle")}</p>
      </Reveal>

      {mapSrc ? (
        <Reveal delay={60} className="space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--text)]">{t("mapTitle")}</h2>
          <YandexMapWithLabels points={mapPoints} zoom={12} fallbackSrc={mapSrc} title={t("mapTitle")} />
        </Reveal>
      ) : null}

      <ul className="grid gap-4 md:grid-cols-2">
        {groups.map((g, i) => {
          const description =
            loc === "en" && g.shortDescriptionEn ? g.shortDescriptionEn : g.shortDescription;
          return (
            <Reveal key={g.id} as="li" delay={i * 70}>
              <Link
                href={`/addresses/${g.slug}`}
                className="card-premium block rounded-2xl border border-[var(--border)] bg-white/50 p-6 hover:border-[var(--accent-secondary)]"
              >
                <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--text)]">{g.name}</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">{description}</p>
                <p className="mt-4 text-xs text-[var(--muted)]">
                  {t("apartmentsCount", { count: g._count.properties })}
                </p>
              </Link>
            </Reveal>
          );
        })}
      </ul>
    </div>
  );
}
