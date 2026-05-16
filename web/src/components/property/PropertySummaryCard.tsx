import type { ReactNode } from "react";
import { Link } from "@/i18n/routing";
import { propertyTypeLabel } from "@/lib/property-display";
import { IconArea, IconBed, IconClock, IconGuests, IconLayout } from "./PropertyIcons";

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
    <li className="flex items-start gap-2.5 text-sm">
      <span className="mt-0.5 shrink-0 text-[var(--accent)]">{icon}</span>
      <span>
        <span className="block text-xs text-[var(--muted)]">{label}</span>
        <span className="font-medium text-[var(--text)]">{value}</span>
      </span>
    </li>
  );
}

export function PropertySummaryCard({
  data,
  labels,
  pricePerNight,
  children,
}: {
  data: PropertySummaryData;
  labels: Labels;
  pricePerNight?: number | null;
  children?: ReactNode;
}) {
  const { locale } = data;
  const layoutLabel = propertyTypeLabel(data.propertyType, locale);
  const roomNote =
    data.propertyType !== "STUDIO" && data.roomsCount > 0
      ? locale === "ru"
        ? `, ${data.roomsCount} комн.`
        : `, ${data.roomsCount} rm`
      : "";
  const guestsValue = locale === "ru" ? `до ${data.guestsMax}` : `up to ${data.guestsMax}`;

  return (
    <div className="property-summary flex h-full flex-col rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_8px_30px_-14px_rgba(47,45,43,0.15)] lg:p-6">
      <h1 className="font-[family-name:var(--font-display)] text-xl leading-snug text-[var(--text)] lg:text-2xl">
        {data.title}
      </h1>
      <p className="mt-1.5 text-sm">
        <Link
          href={`/addresses/${data.groupSlug}`}
          className="text-[var(--muted)] underline-offset-4 hover:text-[var(--text)] hover:underline"
        >
          {data.groupName}
        </Link>
      </p>

      {pricePerNight ? (
        <p className="mt-4 border-b border-[var(--border)] pb-4">
          <span className="font-[family-name:var(--font-display)] text-2xl text-[var(--text)]">
            {pricePerNight}
          </span>
          <span className="ml-1 text-sm text-[var(--muted)]">{labels.perNight}</span>
        </p>
      ) : null}

      <ul className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${pricePerNight ? "mt-4" : "mt-5"}`}>
        <SummaryFact
          icon={<IconGuests className="h-5 w-5" />}
          label={labels.guests}
          value={guestsValue}
        />
        <SummaryFact
          icon={<IconArea className="h-5 w-5" />}
          label={labels.area}
          value={`${data.areaSqm} ${labels.sqm}`}
        />
        <SummaryFact
          icon={<IconLayout className="h-5 w-5" />}
          label={labels.layout}
          value={`${layoutLabel}${roomNote}`}
        />
        {data.sleepingPlaces ? (
          <SummaryFact icon={<IconBed className="h-5 w-5" />} label={labels.beds} value={data.sleepingPlaces} />
        ) : null}
        <SummaryFact
          icon={<IconClock className="h-5 w-5" />}
          label={labels.checkIn}
          value={data.checkInTime}
        />
        <SummaryFact
          icon={<IconClock className="h-5 w-5" />}
          label={labels.checkOut}
          value={data.checkOutTime}
        />
      </ul>

      {(data.internalCode || (data.minStay && data.minStay > 1)) && (
        <p className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
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
          className="mt-3 inline-block text-sm font-medium text-[var(--accent)] underline-offset-4 hover:underline"
        >
          {labels.avito} ↗
        </a>
      ) : null}

      {children ? <div className="mt-auto border-t border-[var(--border)] pt-5">{children}</div> : null}
    </div>
  );
}
