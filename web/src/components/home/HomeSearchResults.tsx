import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/motion/Reveal";
import { PropertyCoverImage } from "@/components/PropertyImages";
import { searchAvailableProperties } from "@/lib/search-available-properties";

type Props = {
  locale: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  groupSlug?: string;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value);
}

export async function HomeSearchResults({ locale, checkIn, checkOut, guests, groupSlug }: Props) {
  const t = await getTranslations("Home");
  const apt = await getTranslations("Apartments");

  const results = await searchAvailableProperties({
    checkIn,
    checkOut,
    guests,
    groupSlug,
  });

  const query = new URLSearchParams({ checkIn, checkOut, guests: String(guests) });

  return (
    <Reveal as="section" id="search-results" className="scroll-mt-28 space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--text)]">
          {t("searchResultsTitle")}
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {results.length > 0
            ? t("searchResultsCount", { count: results.length })
            : t("searchResultsEmpty")}
        </p>
      </div>

      {results.length > 0 ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {results.map((p, i) => (
            <Reveal key={p.id} as="li" delay={i * 50}>
              <article className="card-premium flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white/60">
                <Link href={`/apartments/${p.slug}`} className="card-image-zoom block">
                  <PropertyCoverImage
                    src={p.coverPath}
                    alt={p.publicName}
                    className="aspect-[16/10] w-full"
                  />
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <Link
                    href={`/apartments/${p.slug}`}
                    className="font-[family-name:var(--font-display)] text-lg text-[var(--text)] hover:text-[var(--accent)]"
                  >
                    {p.publicName}
                  </Link>
                  <p className="mt-1 text-sm text-[var(--muted)]">{p.groupName}</p>
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    {apt("guests")}: {p.guestsMax}
                  </p>
                  {p.stayTotal != null ? (
                    <p className="mt-3 text-sm text-[var(--text)]">
                      <span className="font-[family-name:var(--font-display)] text-lg">
                        {formatPrice(p.stayTotal)} ₽
                      </span>
                      <span className="ml-1 text-[var(--muted)]">
                        {t("searchForNights", { nights: p.nights })}
                      </span>
                    </p>
                  ) : null}
                  <Link
                    href={`/apartments/${p.slug}?${query.toString()}#booking`}
                    className="btn-premium mt-4 inline-flex w-full justify-center rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium tracking-wide text-[var(--background)] font-[family-name:var(--font-display)]"
                  >
                    {t("searchBook")}
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-[var(--border)] bg-white/50 px-6 py-8 text-center text-[var(--muted)]">
          {t("searchResultsEmptyHint")}
        </p>
      )}
    </Reveal>
  );
}
