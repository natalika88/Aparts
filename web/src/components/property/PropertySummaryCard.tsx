import type { ReactNode } from "react";
import { Link } from "@/i18n/routing";
import { propertyTypeLabel } from "@/lib/property-display";
import { amenityIcon, IconArea, IconBed, IconClock, IconGuests, IconLayout } from "./PropertyIcons";

export type PropertySummaryData = {
  locale: "ru" | "en";
  title: string;
  groupSlug: string;
  groupName: string;
  propertyType: string;
  roomsCount: number;
  areaSqm: number;
  guestsMax: number;
  sleepingPlaces: string | null;
  checkInTime: string;
  checkOutTime: string;
  minStay?: number;
  internalCode?: string;
  avitoUrl?: string | null;
};

type AmenityItem = { name: string; nameEn: string | null };

type Labels = {
  guests: string;
  area: string;
  sqm: string;
  layout: string;
  beds: string;
  checkIn: string;
  checkOut: string;
  minStay: string;
  nightsShort: string;
  code: string;
  avito: string;
  perNight: string;
  amenitiesTitle: string;
};

function SummaryFact({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-start gap-1.5 text-sm">
      <span className="mt-0.5 shrink-0 text-[var(--accent)]">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[10px] leading-tight text-[var(--muted)]">{label}</span>
        <span className="font-medium leading-tight text-[var(--text)]">{value}</span>
      </span>
    </li>
  );
}

function AmenityItemRow({
  name,
  icon: Icon,
}: {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <li className="flex items-center gap-1.5 text-[13px] leading-tight text-[var(--text)]">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--surface)] text-[var(--accent)]">
        <Icon className="h-3 w-3" />
      </span>
      <span className="min-w-0">{name}</span>
    </li>
  );
}

export function PropertySummaryCard({
  data,
  labels,
  pricePerNight,
  amenities = [],
  children,
}: {
  data: PropertySummaryData;
  labels: Labels;
  pricePerNight?: number | null;
  amenities?: AmenityItem[];
  children?: ReactNode;
}) {
  const { locale } = data;
  const layoutLabel = propertyTypeLabel(data.propertyType, locale);
  const guestsValue = locale === "ru" ? `до ${data.guestsMax}` : `up to ${data.guestsMax}`;
  const hasAmenities = amenities.length > 0;
  const checkTimes = `${labels.checkIn} ${data.checkInTime} · ${labels.checkOut} ${data.checkOutTime}`;

  const factsBlock = hasAmenities ? (
    <div className="mt-2.5 space-y-2.5 border-t border-[var(--border)] pt-2.5">
      <ul className="grid grid-cols-2 gap-x-3 gap-y-2">
        <SummaryFact
          icon={<IconGuests className="h-3.5 w-3.5" />}
          label={labels.guests}
          value={guestsValue}
        />
        <SummaryFact
          icon={<IconArea className="h-3.5 w-3.5" />}
          label={labels.area}
          value={`${data.areaSqm} ${labels.sqm}`}
        />
        <SummaryFact
          icon={<IconLayout className="h-3.5 w-3.5" />}
          label={labels.layout}
          value={layoutLabel}
        />
        {data.sleepingPlaces ? (
          <SummaryFact
            icon={<IconBed className="h-3.5 w-3.5" />}
            label={labels.beds}
            value={data.sleepingPlaces}
          />
        ) : (
          <li className="col-span-1" aria-hidden />
        )}
        <li className="col-span-2 flex items-center gap-1.5 border-t border-[var(--border)]/60 pt-2 text-[13px] text-[var(--muted)]">
          <IconClock className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
          <span>{checkTimes}</span>
        </li>
      </ul>
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-sm leading-tight text-[var(--text)]">
          {labels.amenitiesTitle}
        </h2>
        <ul className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-1.5">
          {amenities.map((a, i) => {
            const name = locale === "en" && a.nameEn ? a.nameEn : a.name;
            const Icon = amenityIcon(a.name);
            return <AmenityItemRow key={`${a.name}-${i}`} name={name} icon={Icon} />;
          })}
        </ul>
      </div>
    </div>
  ) : (
    <ul className={`grid grid-cols-1 gap-2.5 sm:grid-cols-2 ${pricePerNight ? "mt-3 border-t border-[var(--border)] pt-3" : "mt-4"}`}>
      <SummaryFact icon={<IconGuests className="h-5 w-5" />} label={labels.guests} value={guestsValue} />
      <SummaryFact
        icon={<IconArea className="h-5 w-5" />}
        label={labels.area}
        value={`${data.areaSqm} ${labels.sqm}`}
      />
      <SummaryFact icon={<IconLayout className="h-5 w-5" />} label={labels.layout} value={layoutLabel} />
      {data.sleepingPlaces ? (
        <SummaryFact icon={<IconBed className="h-5 w-5" />} label={labels.beds} value={data.sleepingPlaces} />
      ) : null}
      <SummaryFact icon={<IconClock className="h-5 w-5" />} label={labels.checkIn} value={data.checkInTime} />
      <SummaryFact icon={<IconClock className="h-5 w-5" />} label={labels.checkOut} value={data.checkOutTime} />
    </ul>
  );

  return (
    <div className="property-summary flex h-full flex-col rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[0_8px_30px_-14px_rgba(47,45,43,0.15)] lg:p-5">
      <h1 className="font-[family-name:var(--font-display)] text-lg leading-snug text-[var(--text)] lg:text-xl">
        {data.title}
      </h1>
      <p className="mt-1 text-sm leading-snug">
        <Link
          href={`/addresses/${data.groupSlug}`}
          className="text-[var(--muted)] underline-offset-4 hover:text-[var(--text)] hover:underline"
        >
          {data.groupName}
        </Link>
      </p>

      {pricePerNight ? (
        <p className="mt-2 border-b border-[var(--border)] pb-2">
          <span className="font-[family-name:var(--font-display)] text-xl text-[var(--text)]">
            {pricePerNight}
          </span>
          <span className="ml-1 text-sm text-[var(--muted)]">{labels.perNight}</span>
        </p>
      ) : null}

      {factsBlock}

      {(data.internalCode || (data.minStay && data.minStay > 1)) && (
        <p className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-[var(--muted)]">
          {data.internalCode ? (
            <span>
              {labels.code}: {data.internalCode}
            </span>
          ) : null}
          {data.minStay && data.minStay > 1 ? (
            <span>
              {labels.minStay}: {data.minStay} {labels.nightsShort}
            </span>
          ) : null}
        </p>
      )}

      {data.avitoUrl ? (
        <a
          href={data.avitoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 inline-block text-xs font-medium text-[var(--accent)] underline-offset-4 hover:underline"
        >
          {labels.avito} ↗
        </a>
      ) : null}

      {children ? <div className="mt-auto border-t border-[var(--border)] pt-3">{children}</div> : null}
    </div>
  );
}
