import { amenityIcon } from "./PropertyIcons";

export function PropertyAmenitiesCard({
  title,
  locale,
  amenities,
  className = "",
}: {
  title: string;
  locale: "ru" | "en";
  amenities: { name: string; nameEn: string | null }[];
  className?: string;
}) {
  if (amenities.length === 0) return null;

  return (
    <section
      aria-labelledby="property-amenities-heading"
      className={`flex h-full flex-col rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_8px_30px_-14px_rgba(47,45,43,0.1)] lg:p-6 ${className}`}
    >
      <h2
        id="property-amenities-heading"
        className="font-[family-name:var(--font-display)] text-xl text-[var(--text)]"
      >
        {title}
      </h2>
      <ul className="mt-4 flex-1 space-y-2.5">
        {amenities.map((a, i) => {
          const name = locale === "en" && a.nameEn ? a.nameEn : a.name;
          const Icon = amenityIcon(a.name);
          return (
            <li key={`${a.name}-${i}`} className="flex items-center gap-3 text-sm text-[var(--text)]">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface)] text-[var(--accent)]">
                <Icon className="h-4 w-4" />
              </span>
              <span className="leading-snug">{name}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
