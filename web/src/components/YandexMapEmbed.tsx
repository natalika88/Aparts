type YandexMapEmbedProps = {
  src: string;
  title: string;
  className?: string;
};

/** Встроенная карта Яндекса (виджет, без JS API). */
export function YandexMapEmbed({ src, title, className = "" }: YandexMapEmbedProps) {
  return (
    <div
      className={`map-tone overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/30 shadow-sm ${className}`.trim()}
    >
      <iframe
        src={src}
        title={title}
        className="map-tone__media relative z-0 block h-[min(420px,55vh)] w-full border-0"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <span className="map-tone__wash" aria-hidden />
    </div>
  );
}
