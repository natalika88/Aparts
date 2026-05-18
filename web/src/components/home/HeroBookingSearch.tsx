"use client";

import { format, parseISO } from "date-fns";
import { enUS, ru } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { useCallback, useEffect, useRef, useState } from "react";
import { BookingCalendar } from "@/components/booking/BookingCalendar";

export type SearchGroupOption = { slug: string; name: string };

type Panel = "where" | "when" | "who" | null;

export function HeroBookingSearch({ groups }: { groups: SearchGroupOption[] }) {
  const t = useTranslations("Home");
  const locale = useLocale() as "ru" | "en";
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateLocale = locale === "ru" ? ru : enUS;
  const rootRef = useRef<HTMLFormElement>(null);

  const [groupSlug, setGroupSlug] = useState("all");
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [panel, setPanel] = useState<Panel>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ci = searchParams.get("checkIn");
    const co = searchParams.get("checkOut");
    const g = searchParams.get("guests");
    const gr = searchParams.get("group");
    if (ci) setCheckIn(ci);
    if (co) setCheckOut(co);
    if (g) setGuests(Math.max(1, Number(g) || 2));
    if (gr) setGroupSlug(gr);
  }, [searchParams]);

  useEffect(() => {
    if (!panel) return;
    function onDocPointerDown(e: PointerEvent) {
      if (rootRef.current?.contains(e.target as Node)) return;
      setPanel(null);
    }
    document.addEventListener("pointerdown", onDocPointerDown);
    return () => document.removeEventListener("pointerdown", onDocPointerDown);
  }, [panel]);

  function togglePanel(name: Panel) {
    setPanel((current) => (current === name ? null : name));
  }

  const onRangeChange = useCallback((inKey: string | null, outKey: string | null) => {
    setCheckIn(inKey);
    setCheckOut(outKey);
    if (inKey && outKey) setPanel(null);
  }, []);

  const groupLabel =
    groupSlug === "all" ? t("searchAllLocations") : groups.find((g) => g.slug === groupSlug)?.name ?? t("searchAllLocations");

  const datesLabel =
    checkIn && checkOut
      ? `${format(parseISO(checkIn), "d MMM", { locale: dateLocale })} — ${format(parseISO(checkOut), "d MMM", { locale: dateLocale })}`
      : t("searchDatesPlaceholder");

  const guestsLabel =
    locale === "ru"
      ? t("searchGuestsRu", { count: guests })
      : t("searchGuestsEn", { count: guests });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!checkIn || !checkOut) {
      setError(t("searchSelectDates"));
      setPanel("when");
      return;
    }
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: String(guests),
    });
    if (groupSlug !== "all") params.set("group", groupSlug);
    router.push(`/?${params.toString()}#search-results`);
    setPanel(null);
  }

  const calendarLabels = {
    checkIn: locale === "ru" ? "Заезд" : "Check-in",
    checkOut: locale === "ru" ? "Выезд" : "Check-out",
    nights: locale === "ru" ? "ночей" : "nights",
    selectCheckIn: locale === "ru" ? "Выберите дату заезда" : "Select check-in",
    selectCheckOut: locale === "ru" ? "Выберите дату выезда" : "Select check-out",
    unavailable: locale === "ru" ? "Занято" : "Unavailable",
    legendAvailable: locale === "ru" ? "Свободно" : "Available",
    legendBusy: locale === "ru" ? "Занято" : "Busy",
    legendSelected: locale === "ru" ? "Выбрано" : "Selected",
    prevMonth: locale === "ru" ? "Предыдущий месяц" : "Previous month",
    nextMonth: locale === "ru" ? "Следующий месяц" : "Next month",
    minStayHint: locale === "ru" ? "Минимальный срок проживания" : "Minimum stay",
  };

  return (
    <form
      ref={rootRef}
      onSubmit={handleSubmit}
      className="hero-search hero-in hero-in-3 w-full max-w-4xl"
      style={{ pointerEvents: "auto" }}
    >
      <div className="hero-search__bar">
        <div className="hero-search__field relative">
          <button
            type="button"
            className={`hero-search__trigger${panel === "where" ? " hero-search__trigger--open" : ""}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              togglePanel("where");
            }}
            aria-expanded={panel === "where"}
          >
            <span className="hero-search__label">{t("searchWhere")}</span>
            <span className="hero-search__value">{groupLabel}</span>
          </button>
          {panel === "where" ? (
            <div
              className="hero-search__panel"
              role="listbox"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="hero-search__option"
                onClick={() => {
                  setGroupSlug("all");
                  setPanel(null);
                }}
              >
                {t("searchAllLocations")}
              </button>
              {groups.map((g) => (
                <button
                  key={g.slug}
                  type="button"
                  className="hero-search__option"
                  onClick={() => {
                    setGroupSlug(g.slug);
                    setPanel(null);
                  }}
                >
                  {g.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="hero-search__field relative flex-[1.2]">
          <button
            type="button"
            className={`hero-search__trigger${panel === "when" ? " hero-search__trigger--open" : ""}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              togglePanel("when");
            }}
            aria-expanded={panel === "when"}
          >
            <span className="hero-search__label">{t("searchWhen")}</span>
            <span className="hero-search__value">{datesLabel}</span>
          </button>
          {panel === "when" ? (
            <div
              className="hero-search__panel hero-search__panel--wide"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <BookingCalendar
                locale={locale}
                minStay={1}
                blockedDays={[]}
                compact
                onRangeChange={onRangeChange}
                labels={calendarLabels}
              />
            </div>
          ) : null}
        </div>

        <div className="hero-search__field relative">
          <button
            type="button"
            className={`hero-search__trigger${panel === "who" ? " hero-search__trigger--open" : ""}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              togglePanel("who");
            }}
            aria-expanded={panel === "who"}
          >
            <span className="hero-search__label">{t("searchWho")}</span>
            <span className="hero-search__value">{guestsLabel}</span>
          </button>
          {panel === "who" ? (
            <div className="hero-search__panel" onPointerDown={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-[var(--text)]">{t("searchWho")}</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="hero-search__step"
                    disabled={guests <= 1}
                    onClick={() => setGuests((n) => Math.max(1, n - 1))}
                    aria-label="-"
                  >
                    −
                  </button>
                  <span className="min-w-[1.5rem] text-center font-medium">{guests}</span>
                  <button
                    type="button"
                    className="hero-search__step"
                    disabled={guests >= 12}
                    onClick={() => setGuests((n) => Math.min(12, n + 1))}
                    aria-label="+"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <button type="submit" className="hero-search__submit">
          {t("searchFind")}
        </button>
      </div>

      {error ? <p className="mt-2 text-sm text-[var(--accent)]">{error}</p> : null}
    </form>
  );
}
