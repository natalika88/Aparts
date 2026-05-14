import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { PropertyCoverImage } from "@/components/PropertyImages";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function AddressGroupPage({ params }: Props) {
  const { slug } = await params;
  const t = await getTranslations("Apartments");
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

  return (
    <div className="space-y-8">
      <div>
        <Link href="/addresses" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
          ← {nav("addresses")}
        </Link>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-[var(--text)]">{group.name}</h1>
        <p className="mt-2 text-[var(--muted)]">{group.fullAddress}</p>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">{group.shortDescription}</p>
      </div>
      <ul className="grid gap-4 md:grid-cols-2">
        {group.properties.map((p) => (
          <li key={p.id}>
            <Link
              href={`/apartments/${p.slug}`}
              className="block overflow-hidden rounded-2xl border border-[var(--border)] bg-white/50 hover:border-[var(--accent)]"
            >
              <PropertyCoverImage
                src={p.media[0]?.filePath}
                alt={p.publicName}
                className="aspect-[16/10] w-full"
              />
              <div className="p-6">
              <span className="text-xs text-[var(--muted)]">{p.internalCode}</span>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-lg text-[var(--text)]">{p.publicName}</h2>
              {p.basePricePerNight ? (
                <p className="mt-3 text-sm text-[var(--text)]">
                  {t("from")} {p.basePricePerNight} {t("perNight")}
                </p>
              ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
