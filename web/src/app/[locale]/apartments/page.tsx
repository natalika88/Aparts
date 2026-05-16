import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/motion/Reveal";
import { PropertyCoverImage } from "@/components/PropertyImages";

export async function generateMetadata() {
  const t = await getTranslations("Apartments");
  return { title: t("title") };
}

export default async function ApartmentsPage() {
  const t = await getTranslations("Apartments");
  const list = await prisma.property.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ groupId: "asc" }, { sortOrder: "asc" }],
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
    <div className="space-y-8">
      <Reveal immediate>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--text)]">{t("title")}</h1>
        <p className="mt-2 text-[var(--muted)]">
          {t("district")} · {t("group")} · {t("rooms")}
        </p>
      </Reveal>
      <ul className="grid gap-4 md:grid-cols-2">
        {list.map((p, i) => (
          <Reveal key={p.id} as="li" delay={i * 60}>
            <Link
              href={`/apartments/${p.slug}`}
              className="card-premium group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white/50 transition hover:border-[var(--accent)]"
            >
              <div className="card-image-zoom">
                <PropertyCoverImage
                  src={p.media[0]?.filePath}
                  alt={p.publicName}
                  className="aspect-[16/10] w-full shrink-0"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--text)]">
                  {p.publicName}
                </h2>
                <p className="text-sm text-[var(--muted)]">{p.group.name}</p>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  {t("rooms")}: {p.propertyType === "STUDIO" ? "студия" : p.roomsCount} · {t("guests")}:{" "}
                  {p.guestsMax}
                </p>
                {p.basePricePerNight ? (
                  <p className="mt-auto pt-4 text-sm text-[var(--text)]">
                    {t("from")} {p.basePricePerNight} {t("perNight")}
                  </p>
                ) : null}
                <span className="mt-3 text-sm font-medium text-[var(--accent)] transition-transform duration-500 group-hover:translate-x-0.5">
                  {t("details")} →
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
