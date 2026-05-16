"use client";

import { useEffect, useRef, useState } from "react";
import type { MapPoint } from "@/lib/yandex-map";
import { YandexMapEmbed } from "@/components/YandexMapEmbed";

type YMap = {
  geoObjects: { add: (obj: unknown) => void; getBounds: () => number[][] | null };
  setBounds: (bounds: number[][], options?: object) => void;
  destroy: () => void;
};

type YmapsApi = {
  ready: (cb: () => void) => void;
  Map: new (element: HTMLElement, state: object, options?: object) => YMap;
  Placemark: new (coords: number[], properties?: object, options?: object) => unknown;
};

declare global {
  interface Window {
    ymaps?: YmapsApi;
  }
}

let ymapsLoader: Promise<YmapsApi> | null = null;

function loadYmaps(apiKey?: string): Promise<YmapsApi> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Yandex Maps is only available in the browser"));
  }
  if (window.ymaps) {
    return new Promise((resolve) => {
      window.ymaps!.ready(() => resolve(window.ymaps!));
    });
  }
  if (!ymapsLoader) {
    ymapsLoader = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      const key = apiKey?.trim();
      const keyQuery = key ? `apikey=${encodeURIComponent(key)}&` : "";
      script.src = `https://api-maps.yandex.ru/2.1/?${keyQuery}lang=ru_RU`;
      script.async = true;
      script.onload = () => {
        if (!window.ymaps) {
          reject(new Error("Yandex Maps API missing"));
          return;
        }
        window.ymaps.ready(() => resolve(window.ymaps!));
      };
      script.onerror = () => reject(new Error("Yandex Maps script failed"));
      document.head.appendChild(script);
    });
  }
  return ymapsLoader;
}

type YandexMapWithLabelsProps = {
  points: MapPoint[];
  zoom?: number;
  fallbackSrc: string | null;
  title: string;
  className?: string;
};

export function YandexMapWithLabels({
  points,
  zoom = 12,
  fallbackSrc,
  title,
  className = "",
}: YandexMapWithLabelsProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [useFallback, setUseFallback] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

  const pointsKey = points.map((p) => `${p.lat},${p.lng},${p.label ?? ""}`).join("|");

  useEffect(() => {
    if (useFallback || points.length === 0 || !mapRef.current) return;

    let map: YMap | null = null;
    let cancelled = false;

    loadYmaps(apiKey)
      .then((ymaps) => {
        if (cancelled || !mapRef.current) return;

        const avgLat = points.reduce((s, p) => s + p.lat, 0) / points.length;
        const avgLng = points.reduce((s, p) => s + p.lng, 0) / points.length;
        const singleZoom = zoom + 4;

        map = new ymaps.Map(
          mapRef.current,
          {
            center: [avgLat, avgLng],
            zoom: points.length === 1 ? singleZoom : zoom,
            controls: ["zoomControl", "fullscreenControl"],
          },
          { suppressMapOpenBlock: true },
        );

        for (const p of points) {
          const caption = (p.label ?? "").slice(0, 80);
          map.geoObjects.add(
            new ymaps.Placemark(
              [p.lat, p.lng],
              {
                hintContent: p.hint ?? caption,
                balloonContentHeader: p.hint ?? "",
                balloonContentBody: caption,
              },
              {
                preset: "islands#darkGreenDotIconWithCaption",
                iconCaptionMaxWidth: "220",
                iconCaption: caption,
              },
            ),
          );
        }

        if (points.length > 1) {
          const bounds = map.geoObjects.getBounds();
          if (bounds) {
            map.setBounds(bounds, { checkZoomRange: true, zoomMargin: 56 });
          }
        }
      })
      .catch(() => {
        if (!cancelled) setUseFallback(true);
      });

    return () => {
      cancelled = true;
      map?.destroy();
    };
  }, [pointsKey, zoom, apiKey, useFallback]);

  if (useFallback || !points.length) {
    if (!fallbackSrc) return null;
    return (
      <div className={`relative ${className}`.trim()}>
        <YandexMapEmbed src={fallbackSrc} title={title} className="rounded-2xl" />
        {points.length > 0 ? (
          <ul className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex flex-col gap-1.5 p-3 sm:p-4">
            {points.map((p) => (
              <li
                key={`${p.lat}-${p.lng}-${p.label}`}
                className="w-fit max-w-[min(100%,20rem)] rounded-lg border border-[var(--border)] bg-[var(--surface)]/95 px-3 py-1.5 text-xs leading-snug text-[var(--text)] shadow-sm backdrop-blur-sm"
              >
                {p.label}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={`map-tone overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/30 shadow-sm ${className}`.trim()}
    >
      <div
        ref={mapRef}
        className="map-tone__media relative z-0 h-[min(420px,55vh)] w-full"
        role="region"
        aria-label={title}
      />
      <span className="map-tone__wash" aria-hidden />
    </div>
  );
}
