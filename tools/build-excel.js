/**
 * Build Excel from brif-plain-utf8.txt + Apart photo folders
 */
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const ROOT = path.join(__dirname, "..");
const BRIEF = path.join(__dirname, "brif-plain-utf8.txt");
const PHOTO_ROOT = path.join(ROOT, "Apart photo");

function extractAvitoUrls(text) {
  const prefix = "https://www.avito.ru/sankt-peterburg/kvartiry/";
  const urls = [];
  let i = 0;
  while (true) {
    const start = text.indexOf(prefix, i);
    if (start === -1) break;
    let end = start + prefix.length;
    while (end < text.length) {
      const c = text[end];
      if (/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]/.test(c)) {
        end++;
        continue;
      }
      break;
    }
    urls.push({ url: text.slice(start, end), start, end });
    i = end;
  }
  return urls;
}

/** Parse object id + title immediately before URL start */
function parseTitleBeforeUrl(text, urlStart) {
  const head = text.slice(Math.max(0, urlStart - 500), urlStart);
  const iObj = head.lastIndexOf("Объект ");
  const iTypo = head.lastIndexOf("Объкет ");
  const idx = Math.max(iObj, iTypo);
  if (idx === -1) return { id: null, title: "" };
  const after = head.slice(idx + "Объект ".length);

  // «Объект 13-к…» → объект 1, заголовок «3-к…»
  if (/^1\d[-–]/.test(after)) {
    return { id: 1, title: after.slice(1).trim() };
  }
  // «Объект 192-к…» / опечатка «Объкет» → объект 19, заголовок «2-к…»
  if (/^19\d[-–]/.test(after)) {
    return { id: 19, title: after.slice(2).trim() };
  }
  // Опечатка в брифе: «Объект 9к. квартира» вместо «9 … 1-к. квартира»
  let m = after.match(/^([1-9])к\.\s*квартира(.*)$/i);
  if (m) {
    return {
      id: parseInt(m[1], 10),
      title: (`1-к. квартира${m[2] || ""}`).replace(/\s+/g, " ").trim(),
    };
  }

  // «Объект 91-к…» → объект 9, заголовок «1-к…» (аналогично для 2–8)
  m = after.match(/^([2-9])(\d[-–])/);
  if (m) return { id: parseInt(m[1], 10), title: after.slice(1).trim() };

  m = after.match(/^(1[0-9])([А-Яа-яЁёA-Za-z])/);
  if (m) return { id: parseInt(m[1], 10), title: after.slice(2).trim() };

  m = after.match(/^(1[0-9])(\d)/);
  if (m) return { id: parseInt(m[1], 10), title: after.slice(2).trim() };

  m = after.match(/^([1-9])([А-Яа-яЁёA-Za-z])/);
  if (m) return { id: parseInt(m[1], 10), title: after.slice(1).trim() };

  m = after.match(/^([1-9])/);
  if (m) return { id: parseInt(m[1], 10), title: after.slice(1).trim() };

  return { id: null, title: after.trim() };
}

function lastAddressHeaderBefore(text, pos) {
  const chunk = text.slice(0, pos);
  const markers = ["Объекты по адресу", "Объекты расположены:"];
  let bestIdx = -1;
  let bestLen = 0;
  for (const marker of markers) {
    const ix = chunk.lastIndexOf(marker);
    if (ix > bestIdx) {
      bestIdx = ix;
      bestLen = marker.length;
    }
  }
  if (bestIdx === -1) return "";
  let rest = chunk.slice(bestIdx + bestLen).trim();
  const m = rest.match(
    /^(Санкт-Петербург[^О]{8,220}?)((?=Объект \d)|(?=\d+[.,]\s*Объект \d)|(?=\d+–\d+\s*мин)|(?=Гостиный)|(?=Невский)|(?=Площадь)|(?=Маяковская)|(?=Чернышевская)|(?=Василеостровск)|(?=Петроградск)|(?=Горный институт)|(?=Спортивная))/
  );
  if (m) return m[1].replace(/\s+/g, " ").trim();
  const cut = rest.split(/Объект \d/)[0];
  return cut.replace(/\s+/g, " ").trim().slice(0, 220);
}

function extractField(block, label) {
  const i = block.indexOf(label);
  if (i === -1) return "";
  const after = block.slice(i + label.length);
  const stop = after.search(
    /(?=Заезд после:|Выезд до:|Количество гостей:|Бесконтактное|Можно с |Разрешены|Есть отчётные|Расположение|Описание|О квартире|О доме|Отзывы гостей|Цена |https?:\/\/|Объект \d|Правила)/
  );
  const val = stop === -1 ? after : after.slice(0, stop);
  return val.replace(/\s+/g, " ").trim();
}

function extractDescription(block) {
  const i = block.indexOf("Описание");
  if (i === -1) return "";
  let after = block.slice(i + "Описание".length);
  const stops = [
    "Особенности квартиры:",
    "Удобства:",
    "Правила проживания:",
    "Паркинг:",
    "О доме",
    "Отзывы гостей",
    "Объект ",
    "Объекты по адресу",
  ];
  let end = after.length;
  for (const s of stops) {
    const j = after.indexOf(s);
    if (j !== -1 && j < end) end = j;
  }
  return after.slice(0, end).replace(/\s+/g, " ").trim();
}

function extractAmenitiesTags(block) {
  const beforeAbout = block.split("О квартире")[0];
  const tags = [];
  const known = [
    "Wi-Fi",
    "Wi-fi",
    "Микроволновка",
    "Стиральная машина",
    "Посудомоечная машина",
    "Кондиционер",
    "Водонагреватель",
    "Постельное белье",
    "Можно с детьми",
    "Можно с детьми",
    "Можно с питомцем",
    "Бесконтактное заселение",
    "Бесконтактный заезд",
    "Ранний заезд",
    "Поздний заезд",
    "Телевидение",
    "Смарт ТВ",
  ];
  for (const k of known) {
    if (beforeAbout.includes(k)) tags.push(k);
  }
  // dedupe
  return [...new Set(tags)].join(", ");
}

function districtFromAddress(addr) {
  const a = addr || "";
  if (a.includes("Некрасова") || a.includes("Пестеля") || a.includes("Невский пр"))
    return "Центральный";
  if (a.includes("8-я линия") || a.includes("Васильевского острова")) return "Василеостровский";
  return "Санкт-Петербург";
}

function groupNameFromAddress(addr) {
  const a = addr || "";
  if (a.includes("Некрасова")) return "Некрасова, 58";
  if (a.includes("Пестеля")) return "Пестеля, 5";
  if (a.includes("Невский")) return "Невский пр-т, 128";
  if (a.includes("8-я линия") || a.includes("Васильевского острова")) return "8-я линия В.О., 15";
  return a.slice(0, 80);
}

function listPhotoFolders() {
  if (!fs.existsSync(PHOTO_ROOT)) return new Map();
  const dirs = fs.readdirSync(PHOTO_ROOT, { withFileTypes: true });
  const map = new Map();
  for (const d of dirs) {
    if (!d.isDirectory()) continue;
    const m = d.name.match(/^(\d+)\s+/);
    if (m) map.set(parseInt(m[1], 10), path.join(PHOTO_ROOT, d.name));
  }
  return map;
}

function collectImages(folder, max = 8) {
  if (!folder || !fs.existsSync(folder)) return [];
  const files = fs
    .readdirSync(folder)
    .filter((f) => /\.(jpe?g|png|gif|webp|avif)$/i.test(f))
    .sort();
  return files.slice(0, max).map((f) => path.join(folder, f).split(path.sep).join("/"));
}

function main() {
  let text = fs.readFileSync(BRIEF, "utf8");
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  const urls = extractAvitoUrls(text);
  const photoMap = listPhotoFolders();

  const rows = [];
  let seq = 0;
  for (const { url, start, end } of urls) {
    seq++;
    const { id: briefNum, title } = parseTitleBeforeUrl(text, start);
    const addrHeader = lastAddressHeaderBefore(text, start);
    const nextUrlStart =
      urls[seq]?.start ?? text.length;
    const block = text.slice(end, nextUrlStart);

    const priceM = block.match(
      /Цена(?:\s+от)?\s*([\d\s]+)\s*(?:₽|руб)(?:\s*за\s*сутки)?/i
    );
    const price = priceM ? priceM[1].replace(/\s/g, "") : "";

    const rooms = extractField(block, "Количество комнат:");
    const beds = extractField(block, "Кровати:");
    const area = extractField(block, "Общая площадь:");
    const floor = extractField(block, "Этаж:");
    const tech = extractField(block, "Техника:");
    const internet = extractField(block, "Интернет и ТВ:");
    const comfort = extractField(block, "Комфорт:");
    const deposit = extractField(block, "Залог:");
    const checkIn = extractField(block, "Заезд после:");
    const checkOut = extractField(block, "Выезд до:");
    const guests = extractField(block, "Количество гостей:");
    const locationLine = extractField(block, "Расположение");
    const address =
      locationLine && locationLine.startsWith("Санкт")
        ? locationLine
        : addrHeader || locationLine;

    const desc = extractDescription(block);
    const amenityTags = extractAmenitiesTags(block);
    const aboutCompact = [
      beds && `Кровати: ${beds}`,
      area && `Площадь: ${area}`,
      floor && `Этаж: ${floor}`,
      tech && `Техника: ${tech}`,
      internet && `${internet}`,
      comfort && `${comfort}`,
      deposit && `Залог: ${deposit}`,
    ]
      .filter(Boolean)
      .join(" | ");

    const id = briefNum ?? seq;
    const folder = photoMap.get(id);
    const imgs = collectImages(folder);

    rows.push({
      ID: id,
      Порядок_в_брифе: seq,
      Группа_локация: groupNameFromAddress(address || addrHeader),
      Название_карточки: title.replace(/^[\s,.:-]+/, "").slice(0, 200),
      Адрес: (address || addrHeader).replace(/\s+/g, " ").trim(),
      Район: districtFromAddress(address || addrHeader),
      Комнаты: rooms,
      Площадь: area,
      Кровати: beds,
      Гостей_макс: guests,
      Цена_за_ночь_руб: price,
      Цена_будни_руб: "",
      Цена_выходные_руб: "",
      Заезд: checkIn,
      Выезд: checkOut,
      Залог: deposit,
      Удобства_теги: amenityTags,
      О_квартире_структура: aboutCompact,
      Описание: desc,
      Фото_1: imgs[0] || "",
      Фото_2: imgs[1] || "",
      Фото_3: imgs[2] || "",
      Фото_4: imgs[3] || "",
      Фото_5: imgs[4] || "",
      Даты_недоступности: "",
      Ссылка_Авито: url,
      Примечание_парсинга:
        briefNum == null ? `ID взят из порядка; проверить заголовок` : "",
    });
  }

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Объекты");

  const outPath = path.join(ROOT, "apartments-brief.xlsx");
  XLSX.writeFile(wb, outPath);
  console.log("Wrote", outPath, "rows", rows.length);

  // validation
  if (rows.length !== 19) console.warn("Expected 19 rows, got", rows.length);
  const ids = rows.map((r) => r.ID);
  const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (dup.length) console.warn("Duplicate IDs:", dup);
}

main();
