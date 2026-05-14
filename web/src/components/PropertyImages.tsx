import Image from "next/image";

export function PropertyCoverImage({
  src,
  alt,
  className = "",
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-[var(--surface)] text-sm text-[var(--muted)] ${className}`}
        aria-hidden
      >
        фото
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden bg-[var(--surface)] ${className}`}>
      <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />
    </div>
  );
}

export function PropertyPhotoGallery({
  items,
  title,
}: {
  items: { id: string; src: string; alt: string | null }[];
  title: string;
}) {
  if (items.length === 0) return null;
  const [first, ...rest] = items;
  return (
    <section className="space-y-4" aria-label={title}>
      <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] md:aspect-[2.4/1]">
        <Image
          src={first.src}
          alt={first.alt || title}
          fill
          className="object-cover"
          sizes="(max-width:768px) 100vw, 1152px"
          priority
        />
      </div>
      {rest.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {rest.map((m) => (
            <div
              key={m.id}
              className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]"
            >
              <Image src={m.src} alt={m.alt || title} fill className="object-cover" sizes="(max-width:768px) 50vw, 280px" />
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
