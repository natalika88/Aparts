import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/motion/Reveal";
import { PropertyCoverImage } from "@/components/PropertyImages";

export async function generateMetadata() {
  const t = await getTranslations("meta");
  return { title: t("title"), description: t("description") };
}

export default async function HomePage() {
  const t = await getTranslations("Home");
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
      <section className="home-hero">
        <div className="home-hero__bg" aria-hidden />
        <div className="home-hero__wash" aria-hidden />
        <div className="home-hero__content">
          <div className="max-w-2xl space-y-5">
            <h1 className="home-hero__title hero-in hero-in-1 font-[family-name:var(--font-display)] text-4xl leading-[1.08] tracking-tight text-[var(--text)] md:text-5xl lg:text-[3.25rem]">
              {t("heroTitle")}
            </h1>
            <p className="hero-in hero-in-2 max-w-xl text-lg leading-relaxed text-[var(--muted)] md:text-xl">
              {t("heroLead")}
            </p>
            <div className="hero-in hero-in-3 flex flex-wrap gap-3 pt-1">
              <Link
                href="/apartments"
                className="btn-premium rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium tracking-wide text-[var(--background)] font-[family-name:var(--font-display)]"
              >
                {t("ctaTitle")}
              </Link>
              <Link
                href="/#locations"
                className="btn-premium btn-premium-outline rounded-full border border-[var(--border)] px-6 py-3 text-sm font-[family-name:var(--font-display)] tracking-wide text-[var(--text)] hover:bg-[var(--surface)]"
              >
                {t("groupsTitle")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="booking" className="scroll-mt-28 space-y-6">
        <Reveal className="space-y-6">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--text)]">{t("bookingSectionTitle")}</h2>
          <p className="mt-2 max-w-2xl text-[var(--muted)]">{t("bookingSectionLead")}</p>
        </div>
        {featured.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <Link
                  href={`/apartments/${p.slug}#booking`}
                  className="card-premium group flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-white/50 p-5 hover:border-[var(--accent)]"
                >
                  <div className="min-w-0">
                    <h3 className="font-[family-name:var(--font-display)] text-lg text-[var(--text)]">{p.publicName}</h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">{p.group.name}</p>
                  </div>
                  <span className="btn-premium shrink-0 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-medium tracking-wide text-[var(--background)] font-[family-name:var(--font-display)] sm:text-sm">
                    {t("bookApartment")}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        ) : (
          <Link
            href="/apartments"
            className="btn-premium inline-flex rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium tracking-wide text-[var(--background)] font-[family-name:var(--font-display)]"
          >
            {t("ctaTitle")}
          </Link>
        )}
        </Reveal>
      </section>

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
              className="locations-map card-premium relative block h-full min-h-[280px] w-full overflow-hidden rounded-2xl border border-[var(--border)] transition hover:border-[var(--accent-secondary)] md:min-h-0"
            >
              <Image
                src="/images/objects-map.jpg"
                alt={t("objectsMapAlt")}
                fill
                className="object-contain object-top"
                sizes="(max-width: 768px) 100vw, 46vw"
              />
            </Link>
          </Reveal>
        </div>
      </Reveal>

      {featured.length > 0 ? (
        <Reveal as="section" className="space-y-6" delay={80}>
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--text)]">{t("featuredTitle")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 100}>
                <Link
                  href={`/apartments/${p.slug}`}
                  className="card-premium group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white/50 hover:border-[var(--accent)]"
                >
                  <div className="card-image-zoom">
                    <PropertyCoverImage
                      src={p.media[0]?.filePath}
                      alt={p.publicName}
                      className="aspect-[16/10] w-full"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-[family-name:var(--font-display)] text-lg text-[var(--text)]">
                      {p.publicName}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">{p.group.name}</p>
                    {p.basePricePerNight ? (
                      <p className="mt-4 text-sm text-[var(--text)]">
                        {apt("from")} {p.basePricePerNight} {apt("perNight")}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Reveal>
      ) : null}
    </div>
  );
}
