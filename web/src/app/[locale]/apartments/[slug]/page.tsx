import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getPropertyBlockedDays } from "@/lib/property-blocked-days";
import { prisma } from "@/lib/prisma";
import { BookingForm } from "./BookingForm";
import { PropertyCoverImage, PropertyPhotoGallery } from "@/components/PropertyImages";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function ApartmentPage({ params }: Props) {
  const { locale, slug } = await params;
  const loc = locale === "en" ? "en" : "ru";
  const t = await getTranslations("Property");
  const apt = await getTranslations("Apartments");

  const property = await prisma.property.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      group: true,
      media: {
        where: { mediaType: "image" },
        orderBy: { sortOrder: "asc" },
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

  const formLabels = {
    submit: t("book"),
    checkIn: loc === "ru" ? "Заезд" : "Check-in",
    checkOut: loc === "ru" ? "Выезд" : "Check-out",
    guests: apt("guests"),
    name: loc === "ru" ? "Имя" : "Name",
    phone: loc === "ru" ? "Телефон" : "Phone",
    email: "Email",
    comment: loc === "ru" ? "Комментарий" : "Comment",
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

  return (
    <article className="space-y-10">
      <PropertyPhotoGallery
        items={galleryItems}
        title={loc === "en" && property.publicNameEn ? property.publicNameEn : property.publicName}
      />

      <div>
        <Link href="/apartments" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
          ← {apt("title")}
        </Link>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-[var(--text)] md:text-4xl">
          {loc === "en" && property.publicNameEn ? property.publicNameEn : property.publicName}
        </h1>
        <p className="mt-2 text-[var(--muted)]">{property.group.name}</p>
        <p className="mt-1 text-sm">{property.fullAddress}</p>
        {property.basePricePerNight ? (
          <p className="mt-4 text-lg text-[var(--text)]">
            {apt("from")} {property.basePricePerNight} {apt("perNight")}
          </p>
        ) : null}
        {property.avitoListingUrl ? (
          <p className="mt-4">
            <a
              href={property.avitoListingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-[var(--accent)] underline-offset-4 hover:underline"
            >
              {t("avito")} ↗
            </a>
          </p>
        ) : null}
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">{t("calSyncNote")}</p>
      </div>

      <section className="space-y-10">
        <div className="space-y-4 text-[var(--text)]">
          <h2 className="font-[family-name:var(--font-display)] text-xl">{loc === "en" ? "About" : "О жилье"}</h2>
          <p className="leading-relaxed text-[var(--muted)]">
            {loc === "en" && property.fullDescriptionEn ? property.fullDescriptionEn : property.fullDescription}
          </p>
          <p className="text-sm text-[var(--muted)]">
            {loc === "ru" ? "Заезд" : "Check-in"}: {property.checkInTime} · {loc === "ru" ? "Выезд" : "Check-out"}:{" "}
            {property.checkOutTime}
          </p>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 p-4 text-sm text-[var(--muted)]">
            {property.rules}
          </div>
        </div>
        <div id="booking" className="scroll-mt-28 w-full max-w-md">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--text)]">{t("book")}</h2>
          <BookingForm
            slug={slug}
            locale={loc}
            minStay={property.minStayDefault}
            blockedDays={blockedDays}
            labels={formLabels}
          />
        </div>
      </section>

      {related.length > 0 ? (
        <section>
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
