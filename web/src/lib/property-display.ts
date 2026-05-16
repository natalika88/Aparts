export type PropertyTypeCode = "STUDIO" | "ONE_ROOM" | "TWO_ROOM" | "THREE_ROOM";

export function propertyTypeLabel(type: string, locale: "ru" | "en"): string {
  const map: Record<PropertyTypeCode, { ru: string; en: string }> = {
    STUDIO: { ru: "Студия", en: "Studio" },
    ONE_ROOM: { ru: "1 комната", en: "1 room" },
    TWO_ROOM: { ru: "2 комнаты", en: "2 rooms" },
    THREE_ROOM: { ru: "3 комнаты", en: "3 rooms" },
  };
  const row = map[type as PropertyTypeCode];
  return row ? row[locale] : type;
}

/** Разбивает правила и списки преимуществ на пункты для отображения. */
export function splitListText(text: string | null | undefined): string[] {
  if (!text?.trim()) return [];
  return text
    .split(/\n+|(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
}
