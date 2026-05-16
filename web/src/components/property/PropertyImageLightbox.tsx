"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { GalleryItem } from "./PropertyPhotoGallery";

export type LightboxLabels = {
  openFullscreen: string;
  close: string;
  prev: string;
  next: string;
  counter: string;
};

const SWIPE_THRESHOLD_PX = 48;

function useSwipeHandlers(onPrev: () => void, onNext: () => void) {
  const startX = useRef<number | null>(null);
  return {
    onTouchStart: (e: React.TouchEvent) => {
      startX.current = e.touches[0]?.clientX ?? null;
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (startX.current === null) return;
      const endX = e.changedTouches[0]?.clientX ?? startX.current;
      const dx = endX - startX.current;
      if (Math.abs(dx) >= SWIPE_THRESHOLD_PX) {
        if (dx > 0) onPrev();
        else onNext();
      }
      startX.current = null;
    },
  };
}

export function PropertyImageLightbox({
  items,
  title,
  labels,
  activeIndex,
  onIndexChange,
  open,
  onClose,
  mounted,
}: {
  items: GalleryItem[];
  title: string;
  labels: LightboxLabels;
  activeIndex: number;
  onIndexChange: (index: number | ((i: number) => number)) => void;
  open: boolean;
  onClose: () => void;
  mounted: boolean;
}) {
  const goPrev = useCallback(() => {
    onIndexChange((i) => (i <= 0 ? items.length - 1 : i - 1));
  }, [items.length, onIndexChange]);

  const goNext = useCallback(() => {
    onIndexChange((i) => (i >= items.length - 1 ? 0 : i + 1));
  }, [items.length, onIndexChange]);

  const swipeHandlers = useSwipeHandlers(goPrev, goNext);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, goPrev, goNext]);

  if (!open || !mounted || items.length === 0) return null;

  const active = items[activeIndex]!;
  const counterText = labels.counter
    .replace("{current}", String(activeIndex + 1))
    .replace("{total}", String(items.length));
  const hasMany = items.length > 1;

  return createPortal(
    <div
      className="property-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={labels.openFullscreen}
      {...swipeHandlers}
    >
      <button type="button" className="property-lightbox__backdrop" onClick={onClose} aria-label={labels.close} />
      <div className="property-lightbox__toolbar">
        <span className="text-sm text-white/90">{counterText}</span>
        <button type="button" className="property-lightbox__btn" onClick={onClose} aria-label={labels.close}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="property-lightbox__stage">
        {hasMany ? (
          <LightboxNav direction="left" label={labels.prev} onClick={goPrev} />
        ) : null}
        <div className="property-lightbox__image-wrap">
          <Image
            key={active.id}
            src={active.src}
            alt={active.alt || title}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>
        {hasMany ? (
          <LightboxNav direction="right" label={labels.next} onClick={goNext} />
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

function LightboxNav({
  direction,
  label,
  onClick,
}: {
  direction: "left" | "right";
  label: string;
  onClick: () => void;
}) {
  const side = direction === "left" ? "prev" : "next";
  return (
    <button
      type="button"
      className={`property-gallery__nav property-gallery__nav--${side} property-gallery__nav--lightbox`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d={direction === "left" ? "M14 6l-6 6 6 6" : "M10 6l6 6-6 6"}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
