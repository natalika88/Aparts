"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { PropertyImageLightbox, type LightboxLabels } from "./PropertyImageLightbox";

export type GalleryItem = { id: string; src: string; alt: string | null };

type GalleryLabels = LightboxLabels & {
  showAll: string;
};

function MosaicTile({
  item,
  title,
  className,
  sizes,
  priority,
  onClick,
  overlay,
}: {
  item: GalleryItem;
  title: string;
  className: string;
  sizes: string;
  priority?: boolean;
  onClick: () => void;
  overlay?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`property-mosaic__tile group relative min-h-0 overflow-hidden bg-[var(--surface)] ${className}`}
    >
      <Image
        src={item.src}
        alt={item.alt || title}
        fill
        className="object-cover transition duration-300 group-hover:brightness-[0.92]"
        sizes={sizes}
        priority={priority}
      />
      {overlay}
    </button>
  );
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function PropertyPhotoGallery({
  items,
  title,
  labels,
  layout = "preview",
}: {
  items: GalleryItem[];
  title: string;
  labels: GalleryLabels;
  layout?: "mosaic" | "carousel" | "preview";
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const openAt = useCallback((index: number) => {
    setActiveIndex(index);
    setLightboxOpen(true);
  }, []);

  useEffect(() => setMounted(true), []);

  if (items.length === 0) return null;

  const lightbox = (
    <PropertyImageLightbox
      items={items}
      title={title}
      labels={labels}
      activeIndex={activeIndex}
      onIndexChange={setActiveIndex}
      open={lightboxOpen}
      onClose={() => setLightboxOpen(false)}
      mounted={mounted}
    />
  );

  if (layout === "carousel" || layout === "preview") {
    return (
      <CarouselGallery
        items={items}
        title={title}
        labels={labels}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
        openAt={openAt}
        lightbox={lightbox}
        variant={layout === "preview" ? "preview" : "compact"}
      />
    );
  }

  const hero = items[0]!;
  const side = items.slice(1, 5);
  const showAllLabel = labels.showAll.replace("{count}", String(items.length));

  if (items.length === 1) {
    return (
      <section className="property-mosaic w-full" aria-label={title}>
        <MosaicTile
          item={hero}
          title={title}
          className="property-mosaic__solo aspect-[4/3] w-full rounded-2xl md:aspect-[16/10]"
          sizes="100vw"
          priority
          onClick={() => openAt(0)}
        />
        {lightbox}
      </section>
    );
  }

  return (
    <section className="property-mosaic w-full" aria-label={title}>
      {/* Mobile: одно фото + кнопка */}
      <div className="relative md:hidden">
        <MosaicTile
          item={hero}
          title={title}
          className="property-mosaic__mobile-hero aspect-[4/3] w-full rounded-2xl"
          sizes="100vw"
          priority
          onClick={() => openAt(0)}
          overlay={
            items.length > 1 ? (
              <span className="absolute bottom-3 right-3 flex items-center gap-2 rounded-lg border border-white/20 bg-white px-3 py-2 text-sm font-medium text-[var(--text)] shadow-md">
                <GridIcon />
                {showAllLabel}
              </span>
            ) : null
          }
        />
      </div>

      {/* Desktop: hero + сетка 2×2 */}
      <div className="property-mosaic__desktop hidden h-[min(52vh,460px)] min-h-[280px] gap-2 md:grid md:grid-cols-2">
        <MosaicTile
          item={hero}
          title={title}
          className="property-mosaic__hero h-full rounded-l-2xl"
          sizes="50vw"
          priority
          onClick={() => openAt(0)}
        />
        <div
          className={`property-mosaic__side grid h-full min-h-0 gap-2 ${
            side.length <= 1 ? "grid-cols-1 grid-rows-1" : "grid-cols-2 grid-rows-2"
          }`}
        >
          {side.length === 0 ? (
            <div className="rounded-r-2xl bg-[var(--surface)]" aria-hidden />
          ) : (
            side.map((item, i) => {
              const index = i + 1;
              const isLast = i === side.length - 1;
              const round =
                side.length === 1
                  ? "rounded-r-2xl"
                  : side.length === 2
                    ? i === 0
                      ? "rounded-tr-2xl"
                      : "rounded-br-2xl"
                    : i === 0
                      ? "rounded-tr-2xl"
                      : i === 1
                        ? ""
                        : i === 2
                          ? ""
                          : "rounded-br-2xl";

              return (
                <MosaicTile
                  key={item.id}
                  item={item}
                  title={title}
                  className={`h-full min-h-0 ${round}`}
                  sizes="25vw"
                  onClick={() => openAt(index)}
                  overlay={
                    isLast && items.length > 5 ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/35 transition group-hover:bg-black/45">
                        <span className="flex items-center gap-2 rounded-lg border border-white/25 bg-white px-4 py-2.5 text-sm font-medium text-[var(--text)] shadow-lg">
                          <GridIcon />
                          {showAllLabel}
                        </span>
                      </span>
                    ) : null
                  }
                />
              );
            })
          )}
        </div>
      </div>

      {lightbox}
    </section>
  );
}

function CarouselGallery({
  items,
  title,
  labels,
  activeIndex,
  setActiveIndex,
  openAt,
  lightbox,
  variant = "compact",
}: {
  items: GalleryItem[];
  title: string;
  labels: GalleryLabels;
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  openAt: (i: number) => void;
  lightbox: React.ReactNode;
  variant?: "compact" | "preview";
}) {
  const active = items[activeIndex]!;
  const counterText = labels.counter
    .replace("{current}", String(activeIndex + 1))
    .replace("{total}", String(items.length));
  const hasMany = items.length > 1;

  const goPrev = () => setActiveIndex(activeIndex <= 0 ? items.length - 1 : activeIndex - 1);
  const goNext = () => setActiveIndex(activeIndex >= items.length - 1 ? 0 : activeIndex + 1);

  const isPreview = variant === "preview";
  const showAllLabel = labels.showAll.replace("{count}", String(items.length));
  const thumbLimit = isPreview ? 12 : items.length;

  return (
    <section
      className={`property-gallery w-full ${isPreview ? "property-gallery--preview space-y-2" : "mx-auto max-w-md space-y-3 sm:max-w-lg md:max-w-xl"}`}
      aria-label={title}
    >
      <div
        className={`property-gallery__main group relative aspect-[4/3] w-full overflow-hidden border border-[var(--border)] bg-[var(--surface)] ${
          isPreview ? "rounded-xl" : "rounded-2xl"
        }`}
      >
        <button
          type="button"
          className="absolute inset-0 z-0 block w-full cursor-zoom-in"
          onClick={() => openAt(activeIndex)}
          aria-label={labels.openFullscreen}
        >
          <Image
            key={active.id}
            src={active.src}
            alt={active.alt || title}
            fill
            className="object-cover"
            sizes={isPreview ? "(max-width: 1024px) 65vw, 720px" : "(max-width: 640px) 100vw, 672px"}
            priority={activeIndex === 0}
          />
        </button>
        {hasMany ? (
          <>
            <NavBtn side="prev" label={labels.prev} onClick={goPrev} />
            <NavBtn side="next" label={labels.next} onClick={goNext} />
            <span className="pointer-events-none absolute bottom-3 right-3 z-[2] rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {counterText}
            </span>
          </>
        ) : null}
      </div>
      {hasMany ? (
        <div
          className={
            isPreview
              ? "property-gallery__thumbs flex gap-2 overflow-x-auto pb-1"
              : "grid grid-cols-4 gap-2"
          }
        >
          {items.slice(0, thumbLimit).map((m, index) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative shrink-0 overflow-hidden border bg-[var(--surface)] ${
                isPreview ? "property-gallery__thumb h-16 w-20 rounded-lg sm:h-[4.5rem] sm:w-24" : "aspect-[4/3] rounded-lg"
              } ${
                index === activeIndex
                  ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/30"
                  : "border-[var(--border)] hover:border-[var(--accent-secondary)]"
              }`}
            >
              <Image src={m.src} alt="" fill className="object-cover" sizes={isPreview ? "96px" : "120px"} />
            </button>
          ))}
          {isPreview && items.length > thumbLimit ? (
            <button
              type="button"
              onClick={() => openAt(0)}
              className="flex h-16 shrink-0 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-medium text-[var(--text)] sm:h-[4.5rem]"
            >
              <GridIcon />
              {showAllLabel}
            </button>
          ) : null}
        </div>
      ) : null}
      {lightbox}
    </section>
  );
}

function NavBtn({ side, label, onClick }: { side: "prev" | "next"; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`property-gallery__nav property-gallery__nav--${side}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d={side === "prev" ? "M14 6l-6 6 6 6" : "M10 6l6 6-6 6"}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
