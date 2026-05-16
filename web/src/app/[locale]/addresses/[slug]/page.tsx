import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/motion/Reveal";
import { YandexMapWithLabels } from "@/components/YandexMapWithLabels";
import { PropertyCoverImage } from "@/components/PropertyImages";
import { prisma } from "@/lib/prisma";
import { buildYandexMapWidgetUrl, groupToMapPoint, resolveGroupCoords } from "@/lib/yandex-map";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function AddressGroupPage({ params }: Props) {
  const { slug } = await params;
  const t = await getTranslations("Apartments");
  const addr = await getTranslations("Addresses");
  const nav = await getTranslations("Nav");
  const group = await prisma.propertyGroup.findUnique({
    where: { slug },
    include: {
      properties: {
        where: { status: "PUBLISHED" },
        orderBy: { sortOrder: "asc" },
        include: {
          media: {
            where: { mediaType: "image" },
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
        },
      },
    },
  });
  if (!group) notFound();

  const point = groupToMapPoint(group);
  const mapSrc = point ? buildYandexMapWidgetUrl([point], 16) : null;
  const coords = resolveGroupCoords(group);
  const yandexMapsUrl = coords
    ? `https://yandex.ru/maps/?pt=${coords.lng},${coords.lat}&z=17&l=map`
    : `https://yandex.ru/maps/?text=${encodeURIComponent(group.fullAddress)}`;

  return (
    <div className="space-y-8">
      <Reveal immediate>
        <Link href="/addresses" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
          ← {nav("addresses")}
        </Link>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-[var(--text)]">{group.name}</h1>
        <p className="mt-2 text-[var(--muted)]">{group.fullAddress}</p>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">{group.shortDescription}</p>
        <a
          href={yandexMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm text-[var(--accent)] underline-offset-4 hover:underline"
        >
          {addr("openInYandex")} ↗
        </a>
      </Reveal>

      {mapSrc ? (
        <Reveal delay={80} className="space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--text)]">{addr("mapTitle")}</h2>
          <YandexMapWithLabels
            points={point ? [point] : []}
            zoom={16}
            fallbackSrc={mapSrc}
            title={group.fullAddress}
          />
        </Reveal>
      ) : null}

      <ul className="grid gap-4 md:grid-cols-2">
        {group.properties.map((p, i) => (
          <Reveal key={p.id} as="li" delay={i * 60}>
            <Link
              href={`/apartments/${p.slug}`}
              className="card-premium block overflow-hidden rounded-2xl border border-[var(--border)] bg-white/50 hover:border-[var(--accent)]"
            >
              <div className="card-image-zoom">
                <PropertyCoverImage
                  src={p.media[0]?.filePath}
                  alt={p.publicName}
                  className="aspect-[16/10] w-full"
                />
              </div>
              <div className="p-6">
                <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--text)]">{p.publicName}</h2>
                {p.basePricePerNight ? (
                  <p className="mt-3 text-sm text-[var(--text)]">
                    {t("from")} {p.basePricePerNight} {t("perNight")}
                  </p>
                ) : null}
              </div>
            </Link>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
