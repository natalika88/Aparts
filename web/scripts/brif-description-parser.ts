import fs from "fs";
import path from "path";

/** Номер объекта в брифе (1…19) → internalCode */
/** ID объявления Авито → internalCode (из prisma/seed.ts) */
export const AVITO_ITEM_TO_CODE: Record<string, string> = {
  "4572907536": "NKR-01",
  "7964827868": "NKR-02",
  "4125513359": "NKR-03",
  "4124896320": "NKR-04",
  "4124909499": "NKR-05",
  "943184749": "PES-01",
  "1430247052": "PES-02",
  "2364971952": "PES-03",
  "3901084921": "PES-04",
  "3421312021": "PES-05",
  "1028601520": "PES-06",
  "1160858716": "PES-07",
  "1219755096": "PES-08",
  "1463167425": "NEV-01",
  "2973161353": "NEV-02",
  "2077580666": "NEV-03",
  "981361090": "NEV-04",
  "3325625432": "VAS-01",
  "2237568848": "VAS-02",
};

export const BRIF_OBJECT_CODES: Record<number, string> = {
  1: "NKR-01",
  2: "NKR-02",
  3: "NKR-03",
  4: "NKR-04",
  5: "NKR-05",
  6: "PES-01",
  7: "PES-02",
  8: "PES-03",
  9: "PES-04",
  10: "PES-05",
  11: "PES-06",
  12: "PES-07",
  13: "PES-08",
  14: "NEV-01",
  15: "NEV-02",
  16: "NEV-03",
  17: "NEV-04",
  18: "VAS-01",
  19: "VAS-02",
};

export type ParsedBrifProperty = {
  objectIndex: number;
  internalCode: string;
  shortDescription: string;
  shortDescriptionEn: string;
  fullDescription: string;
  fullDescriptionEn: string;
  advantages: string;
  rules: string;
};

const LATIN_TO_CYR: Record<string, string> = {
  a: "а",
  b: "в",
  c: "с",
  d: "д",
  e: "е",
  f: "ф",
  g: "г",
  h: "н",
  i: "и",
  j: "й",
  k: "к",
  l: "л",
  m: "м",
  n: "н",
  o: "о",
  p: "р",
  r: "р",
  s: "с",
  t: "т",
  u: "у",
  v: "в",
  w: "ш",
  x: "х",
  y: "у",
  z: "з",
};

/** Исправляет латинские буквы внутри слов со смешанной кириллицей (выгрузка Авито). */
export function fixMixedCyrillicWord(word: string): string {
  const hasCyr = /[а-яёА-ЯЁ]/.test(word);
  const hasLat = /[a-zA-Z]/.test(word);
  if (!hasCyr || !hasLat) return word;
  return word
    .split("")
    .map((ch) => {
      const lower = ch.toLowerCase();
      const mapped = LATIN_TO_CYR[lower];
      if (!mapped) return ch;
      return ch === lower ? mapped : mapped.toUpperCase();
    })
    .join("");
}

/** Очищает текст брифа от мусора и нормализует кириллицу. */
export function normalizeBrifText(raw: string): string {
  return raw
    .replace(/\u200b/g, "")
    .replace(/[🔥🎯🔑✅❗️🚭🩷🐈⚡️🛁🔺]/g, "")
    .replace(/ПРОВЕРИТЬ НАЛИЧИЕ[^.]*\.?/gi, "")
    .replace(/ЗАБРОНИРОВАТЬ[^.]*\.?/gi, "")
    .replace(/УЮТНЫЕ КВАРТИРЫ-СТУДИИ[^🔺]*🔺?/gi, "")
    .split(/(\s+)/)
    .map((part) => (/\s/.test(part) ? part : fixMixedCyrillicWord(part)))
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

function sliceBetween(text: string, start: RegExp, end: RegExp): string {
  const s = text.search(start);
  if (s < 0) return "";
  const sub = text.slice(s).replace(start, "").trim();
  const e = sub.search(end);
  return (e < 0 ? sub : sub.slice(0, e)).trim();
}

function toBullets(items: string[]): string {
  return items
    .map((line) => line.replace(/^[-•·]\s*/, "").trim())
    .filter((line) => line.length > 4 && !/^https?:/i.test(line))
    .filter((line) => !/ПРОВЕРИТЬ|ЗАБРОНИРОВАТЬ|календар/i.test(line))
    .filter((line) => !/УЮТНЫЕ КВАРТИРЫ-СТУДИИ/i.test(line))
    .map((line) => line.replace(/\.$/, ""))
    .join("\n");
}

function splitFeatureSentences(block: string): string[] {
  const cleaned = block
    .replace(/Особенности квартиры:?/gi, "")
    .replace(/Осoбеннoсти квapтиpы:?/gi, "")
    .trim();

  const sentences = cleaned
    .split(/(?<=[.!?])\s+(?=[А-ЯЁA-Z])|(?<=[.!?])(?=[А-ЯЁ])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12);

  return sentences
    .map((s) => s.replace(/^квартиры:\s*/i, "").trim())
    .filter(
      (s) =>
        s.length > 12 &&
        !/^https?:/i.test(s) &&
        !/ПРОВЕРИТЬ|календар|УЮТНЫЕ КВАРТИРЫ/i.test(s),
    );
}

function parseAvitoMarketingDescription(text: string): {
  description: string;
  features: string[];
  location: string;
} {
  const clean = normalizeBrifText(text);
  const chunks = clean
    .replace(/^[^А-ЯЁA-Za-z]*/, "")
    .split(/⚡️|✅/)
    .map((s) => s.trim())
    .filter(Boolean);

  const rawIntro = chunks[0]?.trim() ?? "";
  const description =
    rawIntro.match(/Студия[^.!?]+[.!?]?/i)?.[0]?.trim() ||
    (rawIntro.length > 30 ? rawIntro.slice(0, 160).trim() : "") ||
    "Уютная студия в центре Санкт-Петербурга, в пешей доступности от метро Площадь Восстания.";

  const features = chunks
    .slice(1)
    .map((s) => s.replace(/^[:\s]+/, "").trim())
    .filter(
      (s) =>
        s.length > 12 &&
        !/Паркинг:|Бронирование|Стоимость проживания|Не для вечеринок|животными по согласованию/i.test(
          s,
        ),
    );

  const location =
    features.find((s) => /Невский|центр|метро|вокзал|достопримечательност|остановка/i.test(s)) ??
    "Невский проспект — в шаговой доступности метро Площадь Восстания, Московский вокзал и главные достопримечательности.";

  return {
    description: /[.!?]$/.test(description) ? description : `${description}.`,
    features: features.filter((s) => s !== location).slice(0, 6),
    location,
  };
}

function firstSentence(text: string): string {
  const m = text.match(/[^.!?]+[.!?]/);
  return (m ? m[0] : text).trim();
}

function buildHook(description: string, highlights: string[]): { ru: string; en: string } {
  const intro = firstSentence(description);
  const feat =
    highlights.find(
      (h) =>
        h.length > 15 &&
        h.length < 120 &&
        !/^квартиры:/i.test(h) &&
        !/Особенности/i.test(h),
    ) ?? "";
  let hook = intro;
  if (feat && !hook.includes(feat.slice(0, 24))) {
    hook = `${intro.replace(/\.$/, "")} — ${feat.replace(/\.$/, "")}.`;
  }
  if (hook.length > 220) hook = `${hook.slice(0, 217).trim()}…`;
  const en = hook
    .replace(/квартира/gi, "apartment")
    .replace(/студия/gi, "studio")
    .replace(/апартаменты/gi, "apartments");
  return { ru: hook, en };
}

function buildFullParagraphs(description: string, location: string): string[] {
  const paras: string[] = [];
  const descParts = description
    .split(/(?<=[.!?])\s+(?=[А-ЯЁ])/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20);
  paras.push(...descParts.slice(0, 3));

  const loc = location
    .split(/(?<=[.!?])\s+(?=[А-ЯЁ])/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20 && !/ПРОВЕРИТЬ|календар/i.test(p));
  if (loc[0]) paras.push(loc[0]);

  return paras.filter((p, i, arr) => arr.indexOf(p) === i);
}

function extractRules(rulesBlock: string): string[] {
  const lines: string[] = [];
  const patterns = [
    /Время заезда[^.!?]*[.!?]?/gi,
    /Время выезда[^.!?]*[.!?]?/gi,
    /Заезд[^.!?]*[.!?]?/gi,
    /Выезд[^.!?]*[.!?]?/gi,
    /Курение[^.!?]*[.!?]?/gi,
    /Время тишины[^.!?]*[.!?]?/gi,
    /Залог[^.!?]*[.!?]?/gi,
    /питомц[^.!?]*[.!?]?/gi,
    /уборк[^.!?]*[.!?]?/gi,
    /Бесконтактн[^.!?]*[.!?]?/gi,
    /Мы на связи[^.!?]*[.!?]?/gi,
    /Ранний заезд[^.!?]*[.!?]?/gi,
    /финальная уборка[^.!?]*[.!?]?/gi,
    /договор аренды[^.!?]*[.!?]?/gi,
  ];
  const seen = new Set<string>();
  for (const re of patterns) {
    const m = rulesBlock.match(re);
    if (m) {
      const line = normalizeBrifText(m[0]).replace(/\s+/g, " ");
      if (line.length > 8 && !seen.has(line)) {
        seen.add(line);
        lines.push(line.endsWith(".") ? line : `${line}.`);
      }
    }
  }
  return lines;
}

function parseObjectBlock(index: number, block: string): ParsedBrifProperty | null {
  const code = BRIF_OBJECT_CODES[index];
  if (!code) return null;

  const text = block;

  let descriptionRaw = sliceBetween(
    text,
    /Описание/i,
    /Особенности|Удобства:|Расположение:|Правила/i,
  );
  let featuresRaw = sliceBetween(text, /Особенности/i, /Удобства:|Расположение:|Правила/i);
  const amenitiesRaw = sliceBetween(text, /Удобства:/i, /Расположение:|Правила/i);
  let locationRaw = sliceBetween(text, /Расположение:/i, /Правила|О доме|Отзывы/i);
  const rulesRaw = sliceBetween(text, /Правила/i, /О доме|Отзывы гостей|Отзывы/i);

  let highlights: string[] = [];

  if (/ПРОВЕРИТЬ|⚡️|🏠/i.test(descriptionRaw)) {
    const avito = parseAvitoMarketingDescription(descriptionRaw);
    descriptionRaw = avito.description;
    locationRaw = avito.location || locationRaw;
    highlights = avito.features;
  }

  descriptionRaw = normalizeBrifText(descriptionRaw).replace(
    /([а-яё])([А-ЯЁ])/g,
    "$1. $2",
  );
  featuresRaw = normalizeBrifText(featuresRaw);
  locationRaw = normalizeBrifText(locationRaw);

  if (!descriptionRaw && !featuresRaw) return null;

  const featureBullets = splitFeatureSentences(featuresRaw);
  if (highlights.length === 0) highlights = [...featureBullets.slice(0, 6)];

  const amenityNote = amenitiesRaw
    ? normalizeBrifText(amenitiesRaw)
        .replace(/Удобства:/gi, "")
        .split(/Спальная зона:|Кухня:|Ванная:|Паркинг:/i)[0]
        ?.trim()
    : "";
  if (amenityNote && amenityNote.length > 20 && highlights.length < 8) {
    const first = amenityNote.slice(0, 120);
    if (!highlights.some((h) => h.includes(first.slice(0, 20)))) {
      highlights.push(first.endsWith(".") ? first : `${first}.`);
    }
  }

  const hook = buildHook(descriptionRaw, highlights);
  const paragraphs = buildFullParagraphs(descriptionRaw, locationRaw);
  const fullRu = paragraphs.join("\n\n");
  const rules = toBullets(extractRules(rulesRaw));

  return {
    objectIndex: index,
    internalCode: code,
    shortDescription: hook.ru,
    shortDescriptionEn: hook.en,
    fullDescription: fullRu || descriptionRaw,
    fullDescriptionEn:
      paragraphs.length > 0
        ? paragraphs
            .map((p) =>
              p
                .replace(/квартира/gi, "apartment")
                .replace(/студия/gi, "studio")
                .replace(/центре города/gi, "the city centre"),
            )
            .join("\n\n")
        : hook.en,
    advantages: toBullets(highlights),
    rules: rules || "Заезд с 14:00, выезд до 11:00. Курение запрещено. Время тишины 22:00–09:00.",
  };
}

function extractAvitoItemId(block: string): string | null {
  const m = block.match(/kvartiry\/[^\s?]+_(\d{8,12})/i);
  return m?.[1] ?? null;
}

function objectIndexForCode(code: string): number {
  const entry = Object.entries(BRIF_OBJECT_CODES).find(([, c]) => c === code);
  return entry ? Number(entry[0]) : 0;
}

export function parseBrifFile(brifPath: string): ParsedBrifProperty[] {
  const raw = fs.readFileSync(brifPath, "utf-8");
  const segments = raw.split(/(?=https:\/\/www\.avito\.ru\/sankt-peterburg\/kvartiry\/)/i);
  const results: ParsedBrifProperty[] = [];
  const seen = new Set<string>();

  for (const segment of segments) {
    const itemId = extractAvitoItemId(segment);
    if (!itemId) continue;
    const code = AVITO_ITEM_TO_CODE[itemId];
    if (!code || seen.has(code)) continue;
    seen.add(code);

    const index = objectIndexForCode(code);
    const parsed = parseObjectBlock(index, segment);
    if (parsed) results.push(parsed);
  }

  return results.sort((a, b) => a.objectIndex - b.objectIndex);
}

export function loadBrifDescriptions(): ParsedBrifProperty[] {
  const root = path.resolve(__dirname, "../..");
  const utf8 = path.join(root, "tools/brif-plain-utf8.txt");
  if (fs.existsSync(utf8)) return parseBrifFile(utf8);
  throw new Error(`Brif file not found: ${utf8}`);
}
