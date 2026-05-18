import Image from "next/image";
import { Suspense } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/motion/Reveal";
import { HeroBookingSearch } from "@/components/home/HeroBookingSearch";
import { HomeSearchResults } from "@/components/home/HomeSearchResults";

export async function generateMetadata() {
  const t = await getTranslations("meta");
  return { title: t("title"), description: t("description") };
}

type SearchParams = {
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  group?: string;
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const t = await getTranslations("Home");
  const locale = await getLocale();
  const params = await searchParams;

  const groups = await prisma.propertyGroup.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { properties: true } },
    },
  });

  const searchGroups = groups.map((g) => ({ slug: g.slug, name: g.name }));

  const checkIn = params.checkIn?.trim();
  const checkOut = params.checkOut?.trim();
  const guests = Math.max(1, Math.min(12, Number(params.guests) || 0));
  const hasSearch = Boolean(checkIn && checkOut && guests > 0);

  return (
    <div className="space-y-16">
      <section className="home-hero">
        <div className="home-hero__media" aria-hidden>
          <div className="home-hero__bg" />
          <div className="home-hero__wash" />
        </div>
        <div className="home-hero__content">
          <div className="grid gap-6 md:grid-cols-[1fr_minmax(16rem,22rem)] md:items-end md:gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="home-hero__intro hero-in hero-in-1 order-1 space-y-2 md:order-2 md:justify-self-end lg:max-w-md">
              <h1 className="home-hero__title font-[family-name:var(--font-display)] text-3xl leading-[1.08] tracking-tight text-[var(--text)] md:text-4xl lg:text-[2.75rem]">
                {t("heroTitle")}
              </h1>
              <p className="text-base leading-relaxed text-[var(--muted)] md:text-lg">
                {t.rich("heroLead", {
                  bold: (chunks) => (
                    <strong className="font-semibold text-[var(--text)]">{chunks}</strong>
                  ),
                })}
              </p>
            </div>
          </div>
          <div id="booking-search" className="home-hero__search-slot scroll-mt-28">
            <Suspense
              fallback={
                <div
                  className="hero-in hero-in-3 h-[4.5rem] max-w-4xl animate-pulse rounded-2xl bg-white/50"
                  aria-hidden
                />
              }
            >
              <HeroBookingSearch groups={searchGroups} />
            </Suspense>
          </div>
        </div>
      </section>

      {hasSearch ? (
        <HomeSearchResults
          locale={locale}
          checkIn={checkIn!}
          checkOut={checkOut!}
          guests={guests}
          groupSlug={params.group}
        />
      ) : null}

      <Reveal as="section" id="locations" className="scroll-mt-28 space-y-6">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--text)]">{t("groupsTitle")}</h2>
        <div className="locations-layout grid gap-8 lg:gap-10">
          <ul className="locations-list relative z-[1] flex min-w-0 flex-col gap-4">
            {groups.map((g, i) => (
              <Reveal key={g.id} as="li" delay={i * 70}>
                <Link
                  href={`/addresses/${g.slug}`}
                  className="card-premium group block rounded-2xl border border-[var(--border)] bg-white/40 p-6 hover:border-[var(--accent-secondary)]"
                >
                  <h3 className="font-[family-name:var(--font-display)] text-lg text-[var(--text)] transition-colors duration-500 group-hover:text-[var(--accent)]">
                    {g.name}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">{g.shortDescription}</p>
                  <p className="mt-4 text-xs text-[var(--muted)]">
                    {g._count.properties}{" "}
                    <span className="lowercase">апартаментов</span>
                  </p>
                </Link>
              </Reveal>
            ))}
          </ul>
          <Reveal delay={80} className="locations-map-column flex min-h-[280px] min-w-0 self-stretch md:min-h-0 md:h-full">
            <Link
              href="/addresses"
              className="locations-map map-tone card-premium relative block h-full min-h-[280px] w-full overflow-hidden rounded-2xl border border-[var(--border)] transition hover:border-[var(--accent-secondary)] md:min-h-0"
            >
              <Image
                src="/images/objects-map.jpg"
                alt={t("objectsMapAlt")}
                fill
                className="map-tone__media object-contain object-top"
                sizes="(max-width: 768px) 100vw, 46vw"
              />
              <span className="map-tone__wash" aria-hidden />
            </Link>
          </Reveal>
        </div>
      </Reveal>

      <Reveal as="section" id="about" className="scroll-mt-28 space-y-6" delay={80}>
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--text)]">{t("aboutTitle")}</h2>
        <div className="glass-panel max-w-3xl space-y-6 rounded-3xl p-8 md:p-10">
          <p className="text-lg leading-relaxed text-[var(--text)] md:text-xl">{t("aboutLead")}</p>
          <p className="leading-relaxed text-[var(--muted)]">{t("aboutBody")}</p>
          <ul className="space-y-3 border-t border-[var(--border)] pt-6" role="list">
            {(["aboutHighlight1", "aboutHighlight2", "aboutHighlight3"] as const).map((key) => (
              <li key={key} className="flex gap-3 leading-relaxed text-[var(--text)]">
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                  aria-hidden
                />
                {t(key)}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/apartments"
              className="btn-premium inline-flex rounded-full px-6 py-3 text-sm font-[family-name:var(--font-display)] tracking-wide"
            >
              {t("aboutCta")}
            </Link>
            <Link
              href="/contacts"
              className="btn-premium btn-premium-outline inline-flex rounded-full border border-[var(--border)] px-6 py-3 text-sm font-[family-name:var(--font-display)] tracking-wide text-[var(--text)] hover:bg-[var(--surface)]"
            >
              {t("aboutCtaSecondary")}
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
