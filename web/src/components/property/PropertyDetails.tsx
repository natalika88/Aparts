import type { ReactNode } from "react";
import { Link } from "@/i18n/routing";
import {
  propertyTypeLabel,
  splitDescriptionParagraphs,
  splitListText,
} from "@/lib/property-display";
import {
  IconArea,
  IconBed,
  IconClock,
  IconFloor,
  IconGuests,
  IconLayout,
  IconPin,
  amenityIcon,
} from "./PropertyIcons";

export type PropertyDetailsData = {
  locale: "ru" | "en";
  groupSlug: string;
  groupName: string;
  fullAddress: string;
  internalCode: string;
  propertyType: string;
  roomsCount: number;
  areaSqm: number;
  guestsMax: number;
  floor: string | null;
  sleepingPlaces: string | null;
  checkInTime: string;
  checkOutTime: string;
  shortDescription: string;
  shortDescriptionEn: string | null;
  fullDescription: string;
  fullDescriptionEn: string | null;
  advantages: string | null;
  rules: string | null;
  amenities: { name: string; nameEn: string | null }[];
};

type Labels = {
  factsTitle: string;
  aboutTitle: string;
  highlightsTitle: string;
  amenitiesTitle: string;
  rulesTitle: string;
  area: string;
  layout: string;
  guests: string;
  floor: string;
  beds: string;
  checkIn: string;
  checkOut: string;
  address: string;
  location: string;
  sqm: string;
};

function FactCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="property-fact flex gap-3 rounded-2xl border border-[var(--border)] bg-white/50 p-4">
      <span className="property-fact__icon flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--accent)]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{label}</p>
        <p className="mt-0.5 font-[family-name:var(--font-display)] text-lg leading-tight text-[var(--text)]">
          {value}
        </p>
      </div>
    </div>
  );
}

function HighlightRow({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description?: ReactNode;
}) {
  return (
    <li className="property-highlight flex gap-4 border-b border-[var(--border)] py-5 last:border-b-0">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center text-[var(--text)]">{icon}</span>
      <div className="min-w-0">
        <p className="font-medium text-[var(--text)]">{title}</p>
        {description ? <div className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{description}</div> : null}
      </div>
    </li>
  );
}

export function PropertyDetails({
  data,
  labels,
  presentation = "default",
}: {
  data: PropertyDetailsData;
  labels: Labels;
  presentation?: "default" | "airbnb" | "detailed" | "about" | "sidebar";
}) {
  const { locale } = data;
  const title =
    locale === "en" && data.shortDescriptionEn ? data.shortDescriptionEn : data.shortDescription;
  const about =
    locale === "en" && data.fullDescriptionEn ? data.fullDescriptionEn : data.fullDescription;
  const layoutLabel = propertyTypeLabel(data.propertyType, locale);
  const roomNote =
    data.propertyType !== "STUDIO" && data.roomsCount > 0
      ? locale === "ru"
        ? ` · ${data.roomsCount} комн.`
        : ` · ${data.roomsCount} rm`
      : "";

  const ruleItems = splitListText(data.rules);
  const advantageItems = splitListText(data.advantages);
  const aboutParagraphs = splitDescriptionParagraphs(about);

  const guestsValue = locale === "ru" ? `до ${data.guestsMax} гостей` : `up to ${data.guestsMax} guests`;
  const layoutValue = `${layoutLabel}${roomNote}`;
  const areaValue = `${data.areaSqm} ${labels.sqm}`;

  const addressSection = (
    <section aria-labelledby="property-address-heading" className="rounded-2xl border border-[var(--border)] bg-white/50 p-5">
      <h2 id="property-address-heading" className="property-section-title">
        {labels.address}
      </h2>
      <p className="mt-2 text-[var(--text)]">{data.fullAddress}</p>
      <Link
        href={`/addresses/${data.groupSlug}`}
        className="mt-2 inline-block text-sm font-medium text-[var(--accent)] underline-offset-4 hover:underline"
      >
        {labels.location}: {data.groupName} →
      </Link>
    </section>
  );

  const aboutSection = (
    <section aria-labelledby="property-about-heading">
      <h2 id="property-about-heading" className="property-section-title">
        {labels.aboutTitle}
      </h2>
      {title && title !== about && !aboutParagraphs.some((p) => p.startsWith(title.slice(0, 40))) ? (
        <p className="mt-4 text-lg font-medium leading-relaxed text-[var(--text)]">{title}</p>
      ) : null}
      <div className="mt-4 space-y-4">
        {aboutParagraphs.length > 0 ? (
          aboutParagraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)} className="leading-relaxed text-[var(--muted)]">
              {paragraph}
            </p>
          ))
        ) : (
          <p className="leading-relaxed text-[var(--muted)]">{about}</p>
        )}
      </div>
      {advantageItems.length > 0 ? (
        <div className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--text)]">
            {labels.highlightsTitle}
          </h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {advantageItems.map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-xl border border-[var(--border)] bg-white/60 px-4 py-3 text-sm leading-relaxed text-[var(--text)]"
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );

  const amenitiesSection =
    data.amenities.length > 0 ? (
      <section aria-labelledby="property-amenities-heading">
        <h2 id="property-amenities-heading" className="property-section-title">
          {labels.amenitiesTitle}
        </h2>
        <ul className="mt-4 space-y-2.5">
          {data.amenities.map((a, i) => {
            const name = locale === "en" && a.nameEn ? a.nameEn : a.name;
            const Icon = amenityIcon(a.name);
            return (
              <li key={`${a.name}-${i}`} className="flex items-center gap-3 text-sm text-[var(--text)]">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface)] text-[var(--accent)]">
                  <Icon className="h-4 w-4" />
                </span>
                {name}
              </li>
            );
          })}
        </ul>
      </section>
    ) : null;

  const rulesSection =
    ruleItems.length > 0 ? (
      <section aria-labelledby="property-rules-heading">
        <h2 id="property-rules-heading" className="property-section-title">
          {labels.rulesTitle}
        </h2>
        <ul className="mt-4 space-y-2.5">
          {ruleItems.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-[var(--muted)]">
              <span className="mt-1.5 shrink-0 text-[var(--accent)]" aria-hidden>
                ·
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>
    ) : null;

  if (presentation === "about") {
    return (
      <div className="space-y-8">
        {addressSection}
        {aboutSection}
      </div>
    );
  }

  if (presentation === "sidebar") {
    if (!amenitiesSection && !rulesSection) return null;
    return (
      <div className="property-sidebar rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_8px_30px_-14px_rgba(47,45,43,0.12)] lg:p-6">
        <div className="space-y-8">
          {amenitiesSection}
          {rulesSection ? (
            <div className={amenitiesSection ? "border-t border-[var(--border)] pt-8" : ""}>{rulesSection}</div>
          ) : null}
        </div>
      </div>
    );
  }

  if (presentation === "detailed") {
    return (
      <div className="space-y-10">
        {addressSection}
        {aboutSection}
        {amenitiesSection}
        {rulesSection}
      </div>
    );
  }

  if (presentation === "airbnb") {
    return (
      <div className="space-y-10">
        <section aria-labelledby="property-highlights-heading" className="border-b border-[var(--border)]">
          <h2 id="property-highlights-heading" className="sr-only">
            {labels.factsTitle}
          </h2>
          <ul>
            <HighlightRow
              icon={<IconLayout className="h-6 w-6" />}
              title={layoutValue}
              description={`${labels.area}: ${areaValue} · ${guestsValue}`}
            />
            <HighlightRow
              icon={<IconClock className="h-6 w-6" />}
              title={`${labels.checkIn} ${data.checkInTime} · ${labels.checkOut} ${data.checkOutTime}`}
            />
            <HighlightRow
              icon={<IconPin className="h-6 w-6" />}
              title={data.fullAddress}
              description={
                <Link
                  href={`/addresses/${data.groupSlug}`}
                  className="font-medium text-[var(--accent)] underline-offset-4 hover:underline"
                >
                  {labels.location}: {data.groupName}
                </Link>
              }
            />
            {data.sleepingPlaces ? (
              <HighlightRow
                icon={<IconBed className="h-6 w-6" />}
                title={data.sleepingPlaces}
                description={labels.beds}
              />
            ) : null}
          </ul>
        </section>
        {addressSection}
        {aboutSection}
        {amenitiesSection}
        {rulesSection}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section aria-labelledby="property-facts-heading">
        <h2 id="property-facts-heading" className="property-section-title">
          {labels.factsTitle}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <FactCard icon={<IconArea />} label={labels.area} value={`${data.areaSqm} ${labels.sqm}`} />
          <FactCard icon={<IconLayout />} label={labels.layout} value={`${layoutLabel}${roomNote}`} />
          <FactCard
            icon={<IconGuests />}
            label={labels.guests}
            value={locale === "ru" ? `до ${data.guestsMax}` : `up to ${data.guestsMax}`}
          />
          {data.floor ? (
            <FactCard icon={<IconFloor />} label={labels.floor} value={data.floor} />
          ) : null}
          {data.sleepingPlaces ? (
            <FactCard icon={<IconBed />} label={labels.beds} value={data.sleepingPlaces} />
          ) : null}
          <FactCard icon={<IconClock />} label={labels.checkIn} value={data.checkInTime} />
          <FactCard icon={<IconClock />} label={labels.checkOut} value={data.checkOutTime} />
        </div>
        <div className="property-fact property-fact--wide mt-3 flex gap-3 rounded-2xl border border-[var(--border)] bg-white/50 p-4">
          <span className="property-fact__icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--accent)]">
            <IconPin />
          </span>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{labels.address}</p>
            <p className="mt-0.5 text-[var(--text)]">{data.fullAddress}</p>
            <Link
              href={`/addresses/${data.groupSlug}`}
              className="mt-2 inline-block text-sm font-medium text-[var(--accent)] underline-offset-4 hover:underline"
            >
              {labels.location}: {data.groupName} →
            </Link>
          </div>
        </div>
      </section>

      {data.amenities.length > 0 ? (
        <section aria-labelledby="property-amenities-heading">
          <h2 id="property-amenities-heading" className="property-section-title">
            {labels.amenitiesTitle}
          </h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {data.amenities.map((a, i) => {
              const name = locale === "en" && a.nameEn ? a.nameEn : a.name;
              const Icon = amenityIcon(a.name);
              return (
                <li
                  key={`${a.name}-${i}`}
                  className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]/35 px-3 py-2.5 text-sm text-[var(--text)]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/70 text-[var(--accent)]">
                    <Icon className="h-4 w-4" />
                  </span>
                  {name}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="property-about-heading" className="glass-panel rounded-3xl p-6 md:p-8">
        <h2 id="property-about-heading" className="property-section-title">
          {labels.aboutTitle}
        </h2>
        {title && title !== about ? (
          <p className="mt-4 text-lg leading-relaxed text-[var(--text)]">{title}</p>
        ) : null}
        <p className="mt-3 leading-relaxed text-[var(--muted)]">{about}</p>
        {advantageItems.length > 0 ? (
          <ul className="mt-5 space-y-2 border-t border-[var(--border)] pt-5">
            {advantageItems.map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-relaxed text-[var(--text)]">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--accent-secondary)]" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {ruleItems.length > 0 ? (
        <section
          aria-labelledby="property-rules-heading"
          className="rounded-3xl border border-[var(--border)] bg-[var(--surface)]/40 p-6 md:p-8"
        >
          <h2 id="property-rules-heading" className="property-section-title">
            {labels.rulesTitle}
          </h2>
          <ul className="mt-4 space-y-2">
            {ruleItems.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-relaxed text-[var(--muted)]">
                <span
                  className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--background)] text-[11px] font-medium text-[var(--accent)]"
                  aria-hidden
                >
                  ·
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
