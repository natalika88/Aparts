import Image from "next/image";

export { PropertyPhotoGallery } from "@/components/property/PropertyPhotoGallery";
export type { GalleryItem } from "@/components/property/PropertyPhotoGallery";

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
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        sizes="(max-width:768px) 100vw, 50vw"
      />
    </div>
  );
}
