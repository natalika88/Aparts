import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getPropertyBlockedDays } from "@/lib/property-blocked-days";
import { prisma } from "@/lib/prisma";
import { BookingForm } from "./BookingForm";
import { PropertyCoverImage, PropertyPhotoGallery } from "@/components/PropertyImages";
import { PropertyDetails } from "@/components/property/PropertyDetails";
import { PropertySummaryCard } from "@/components/property/PropertySummaryCard";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function ApartmentPage({ params }: Props) {
  const { locale, slug } = await params;
  const loc = locale === "en" ? "en" : "ru";
  const t = await getTranslations("Property");
  const apt = await getTranslations("Apartments");
  const nav = await getTranslations("Nav");

  const property = await prisma.property.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      group: true,
      media: {
        where: { mediaType: "image" },
        orderBy: { sortOrder: "asc" },
      },
      amenities: {
        include: { amenity: true },
        orderBy: { amenity: { sortOrder: "asc" } },
      },
    },
  });
  if (!property) notFound();

  const blockedDays = await getPropertyBlockedDays(property.id);

  const related = await prisma.property.findMany({
    where: { groupId: property.groupId, status: "PUBLISHED", NOT: { id: property.id } },
    take: 4,
    orderBy: { sortOrder: "asc" },
    include: {
      media: {
        where: { mediaType: "image" },
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
  });

  const galleryItems = property.media
    .filter((m) => m.filePath)
    .map((m) => ({ id: m.id, src: m.filePath!, alt: m.altText }));

  const propertyTitle =
    loc === "en" && property.publicNameEn ? property.publicNameEn : property.publicName;

  const formLabels = {
    submit: t("book"),
    checkIn: t("checkIn"),
    checkOut: t("checkOut"),
    guests: apt("guests"),
    name: loc === "ru" ? "Имя" : "Name",
    phone: loc === "ru" ? "Телефон" : "Phone",
    email: "Email",
    comment: loc === "ru" ? "Комментарий" : "Comment",
    personalDataConsent: t("personalData.consent"),
    privacyLink: t("personalData.privacyLink"),
    calendar: {
      nights: t("calendar.nights"),
      selectCheckIn: t("calendar.selectCheckIn"),
      selectCheckOut: t("calendar.selectCheckOut"),
      unavailable: "",
      legendAvailable: t("calendar.legendAvailable"),
      legendBusy: t("calendar.legendBusy"),
      legendSelected: t("calendar.legendSelected"),
      prevMonth: t("calendar.prevMonth"),
      nextMonth: t("calendar.nextMonth"),
      minStayHint: t("calendar.minStayHint"),
    },
    error: {
      validation: loc === "ru" ? "Проверьте поля формы" : "Please check the form",
      not_found: loc === "ru" ? "Объект не найден" : "Not found",
      dates: loc === "ru" ? "Дата выезда должна быть позже заезда" : "Check-out must be after check-in",
      min_stay: loc === "ru" ? "Слишком короткое проживание" : "Below minimum stay",
      unavailable: loc === "ru" ? "Даты заняты или заблокированы" : "Dates unavailable",
    },
  };

  const detailLabels = {
    factsTitle: t("factsTitle"),
    aboutTitle: t("aboutTitle"),
    highlightsTitle: t("highlightsTitle"),
    amenitiesTitle: t("amenitiesTitle"),
    area: t("area"),
    layout: t("layout"),
    guests: t("guests"),
    floor: t("floor"),
    beds: t("beds"),
    checkIn: t("checkIn"),
    checkOut: t("checkOut"),
    address: t("address"),
    location: t("location"),
    sqm: t("sqm"),
  };

  const galleryLabels = {
    openFullscreen: t("galleryOpen"),
    close: t("galleryClose"),
    prev: t("galleryPrev"),
    next: t("galleryNext"),
    counter: t("galleryCounter"),
    showAll: t("galleryShowAll"),
  };

  const summaryLabels = {
    guests: t("guests"),
    area: t("area"),
    sqm: t("sqm"),
    layout: t("layout"),
    beds: t("beds"),
    checkIn: t("checkIn"),
    checkOut: t("checkOut"),
    minStay: t("minStay"),
    nightsShort: t("nightsShort"),
    code: t("code"),
    avito: t("avito"),
    perNight: apt("perNight"),
    amenitiesTitle: t("amenitiesTitle"),
  };

  const summaryAmenities = property.amenities.map((pa) => ({
    name: pa.amenity.name,
    nameEn: pa.amenity.nameEn,
  }));

  const propertyDetailsData = {
    locale: loc,
    groupSlug: property.group.slug,
    groupName: property.group.name,
    fullAddress: property.fullAddress,
    internalCode: property.internalCode,
    propertyType: property.propertyType,
    roomsCount: property.roomsCount,
    areaSqm: property.areaSqm,
    guestsMax: property.guestsMax,
    floor: property.floor,
    sleepingPlaces: property.sleepingPlaces,
    checkInTime: property.checkInTime,
    checkOutTime: property.checkOutTime,
    shortDescription: property.shortDescription,
    shortDescriptionEn: property.shortDescriptionEn,
    fullDescription: property.fullDescription,
    fullDescriptionEn: property.fullDescriptionEn,
    advantages: property.advantages,
    amenities: property.amenities.map((pa) => ({
      name: pa.amenity.name,
      nameEn: pa.amenity.nameEn,
    })),
  };

  return (
    <article className="space-y-10">
      <nav aria-label="Breadcrumb" className="text-sm text-[var(--muted)]">
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <li>
            <Link href="/" className="hover:text-[var(--text)]">
              {nav("home")}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/apartments" className="hover:text-[var(--text)]">
              {apt("title")}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-[var(--text)]" aria-current="page">
            {propertyTitle}
          </li>
        </ol>
      </nav>

      <section className="property-hero grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,28rem)] lg:items-stretch lg:gap-10 xl:grid-cols-[minmax(0,1.15fr)_26rem]">
        <PropertyPhotoGallery
          items={galleryItems}
          title={propertyTitle}
          labels={galleryLabels}
          layout="preview"
        />

        <PropertySummaryCard
          data={{
            locale: loc,
            title: propertyTitle,
            groupSlug: property.group.slug,
            groupName: property.group.name,
            propertyType: property.propertyType,
            roomsCount: property.roomsCount,
            areaSqm: property.areaSqm,
            guestsMax: property.guestsMax,
            sleepingPlaces: property.sleepingPlaces,
            checkInTime: property.checkInTime,
            checkOutTime: property.checkOutTime,
            minStay: property.minStayDefault,
            internalCode: property.internalCode,
            avitoUrl: property.avitoListingUrl,
          }}
          labels={summaryLabels}
          pricePerNight={property.basePricePerNight}
          amenities={summaryAmenities}
        />
      </section>

      <section
        className="border-t border-[var(--border)] pt-10"
        aria-labelledby="property-details-heading"
      >
        <div className="property-details grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,28rem)] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,1.15fr)_26rem]">
          <div className="min-w-0 space-y-10">
            <h2 id="property-details-heading" className="sr-only">
              {detailLabels.aboutTitle}
            </h2>
            <PropertyDetails data={propertyDetailsData} labels={detailLabels} presentation="about" />
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <section
              id="booking"
              className="property-booking-card scroll-mt-28 w-full rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_8px_30px_-14px_rgba(47,45,43,0.12)] sm:p-6"
              aria-labelledby="property-booking-heading"
            >
            <h2
              id="property-booking-heading"
              className="font-[family-name:var(--font-display)] text-xl text-[var(--text)]"
            >
              {t("book")}
            </h2>
            {property.basePricePerNight ? (
              <p className="mt-2 text-sm text-[var(--muted)]">
                <span className="font-[family-name:var(--font-display)] text-xl text-[var(--text)]">
                  {property.basePricePerNight}
                </span>{" "}
                {apt("perNight")}
              </p>
            ) : null}
            <BookingForm
              slug={slug}
              locale={loc}
              minStay={property.minStayDefault}
              blockedDays={blockedDays}
              labels={formLabels}
              embedded
            />
            <p className="mt-4 text-xs leading-relaxed text-[var(--muted)]">{t("calSyncNote")}</p>
            </section>
          </aside>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="border-t border-[var(--border)] pt-10">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--text)]">
            {loc === "ru" ? "В этой локации" : "Same location"}
          </h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {related.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/apartments/${p.slug}`}
                  className="flex overflow-hidden rounded-xl border border-[var(--border)] bg-white/50 hover:border-[var(--accent)]"
                >
                  <PropertyCoverImage
                    src={p.media[0]?.filePath}
                    alt={loc === "en" && p.publicNameEn ? p.publicNameEn : p.publicName}
                    className="h-24 w-28 shrink-0"
                  />
                  <div className="min-w-0 p-3">
                    <p className="font-medium text-[var(--text)]">
                      {loc === "en" && p.publicNameEn ? p.publicNameEn : p.publicName}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
