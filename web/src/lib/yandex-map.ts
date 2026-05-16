export type MapPoint = {
  lat: number;
  lng: number;
  /** Подпись у метки на карте */
  label?: string;
  /** Всплывающая подсказка при наведении */
  hint?: string;
};

/** Короткая подпись для метки: без «Санкт-Петербург», остальное адресом. */
export function formatMapAddressLabel(fullAddress: string): string {
  const parts = fullAddress
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const skip = new Set(["санкт-петербург", "спб", "saint petersburg", "st. petersburg"]);
  const rest = parts.filter((p) => !skip.has(p.toLowerCase()));
  if (rest.length === 0) return fullAddress.trim();
  if (rest.length <= 2) return rest.join(", ");
  return rest.slice(-2).join(", ");
}

/** Координаты локаций (если в БД ещё не заполнены). */
/** Координаты домов по Яндекс.Картам (WGS84). */
export const GROUP_COORDS_BY_SLUG: Record<string, { lat: number; lng: number }> = {
  nekrasova: { lat: 59.938509, lng: 30.367503 },
  pestelya: { lat: 59.941912, lng: 30.340814 },
  nevskiy: { lat: 59.930624, lng: 30.366398 },
  vasilevskiy: { lat: 59.937607, lng: 30.28202 },
};

export function resolveGroupCoords(group: {
  slug: string;
  latitude: number | null;
  longitude: number | null;
}): { lat: number; lng: number } | null {
  if (group.latitude != null && group.longitude != null) {
    return { lat: group.latitude, lng: group.longitude };
  }
  return GROUP_COORDS_BY_SLUG[group.slug] ?? null;
}

/**
 * URL виджета Яндекс.Карт (ll и pt: долгота, затем широта).
 * @see https://yandex.ru/dev/maps/mapstools/constructor/
 */
export function buildYandexMapWidgetUrl(points: MapPoint[], zoom?: number): string | null {
  if (points.length === 0) return null;

  const pt = points.map((p) => `${p.lng},${p.lat},pm2rdm`).join("~");
  const avgLat = points.reduce((s, p) => s + p.lat, 0) / points.length;
  const avgLng = points.reduce((s, p) => s + p.lng, 0) / points.length;
  const z = zoom ?? (points.length > 1 ? 12 : 16);

  const params = new URLSearchParams({
    ll: `${avgLng},${avgLat}`,
    z: String(z),
    pt,
    l: "map",
  });

  return `https://yandex.ru/map-widget/v1/?${params.toString()}`;
}

export function groupToMapPoint(group: {
  slug: string;
  latitude: number | null;
  longitude: number | null;
  name: string;
  fullAddress: string;
}): MapPoint | null {
  const coords = resolveGroupCoords(group);
  if (!coords) return null;
  return {
    ...coords,
    label: formatMapAddressLabel(group.fullAddress),
    hint: group.name,
  };
}
