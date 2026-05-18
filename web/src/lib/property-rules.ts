/** Условия проживания (формат: заголовок блока, затем пункты с новой строки). */

/** Маркер актуального шаблона в БД — для подстановки обновлённого текста на сайте. */
export const COMPACT_RULES_MARKER = "Время заезда и выезда";

export const COMPACT_PROPERTY_RULES_RU = `${COMPACT_RULES_MARKER}
Заезд — с 14:00, выезд — до 12:00. Нужно другое время? Напишите нам заранее — постараемся подстроиться (иногда это доплата).
Для заезда попросим фото паспорта: разворот и страница с пропиской.

Комфорт соседей
Просим не курить в квартире, на балконе и в подъезде — так спокойнее всем.
Без вечеринок и громкой музыки, пожалуйста. С 22:00 до 08:00 — время тишины.

Кто с нами останавливается
В апартаментах живут только гости из вашей брони. Будем благодарны, если не приглашаете посторонних.

Перед отъездом
Помойте, пожалуйста, посуду и вынесите мусор — так квартира быстрее готовится к следующим гостям.
Залог вернём в течение суток после выезда, если всё в порядке.
Если что-то случайно повредится — спокойно обсудим восстановление.

С питомцами
С радостью примем, если заранее согласуем: обычно это небольшая доплата и чуть больший залог.

Если возникли сложности
За курение, ночной шум или жалобы соседей может понадобиться удержать часть залога. Нам важно, чтобы всем было уютно — лучше написать нам заранее, чем разбираться на месте.`;

export const COMPACT_PROPERTY_RULES_EN = `Check-in and check-out
Check-in from 14:00, check-out by 12:00. Need different times? Message us in advance — we will try to help (an extra fee may apply).
We will ask for passport photos (ID page and registration) to complete check-in.

A quiet, friendly stay
Please do not smoke in the apartment, on the balcony, or in the building — it keeps things comfortable for everyone.
No parties or loud music, please. Quiet hours are 22:00–08:00.

Who can stay
Only guests on your booking may stay. Please avoid inviting visitors who are not on the reservation.

Before you leave
Kindly wash the dishes and take out the trash — it helps us prepare the apartment for the next guests.
We refund the deposit within 24 hours after check-out when everything is in order.
If something is accidentally damaged, we will discuss a fair solution together.

Pets
We are happy to welcome pets when agreed in advance — usually a small extra fee and a slightly higher deposit.

If something goes wrong
Smoking, night noise, or neighbour complaints may require part of the deposit to be withheld. We want everyone to feel at home — please message us early rather than leaving issues until the last minute.`;

export type PropertyRulesSection = {
  title: string;
  items: string[];
};

/** Разбирает условия на блоки с заголовком и пунктами. */
export function parsePropertyRulesSections(text: string | null | undefined): PropertyRulesSection[] {
  if (!text?.trim()) return [];

  const blocks = text
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  if (blocks.length > 1) {
    return blocks.map((block) => {
      const lines = block.split(/\n/).map((l) => l.trim()).filter(Boolean);
      const first = lines[0] ?? "";
      const looksLikeTitle =
        lines.length > 1 &&
        first.length <= 48 &&
        !first.endsWith(".") &&
        !/^[-•·]/.test(first) &&
        !/^\d{1,2}:\d{2}/.test(first);

      if (looksLikeTitle) {
        return {
          title: first,
          items: lines.slice(1).map((l) => l.replace(/^[-•·]\s*/, "")),
        };
      }
      return { title: "", items: lines.map((l) => l.replace(/^[-•·]\s*/, "")) };
    });
  }

  const lines = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 2);

  if (lines.length > 1 && lines.every((l) => l.length < 120)) {
    return [{ title: "", items: lines.map((l) => l.replace(/^[-•·]\s*/, "")) }];
  }

  return [
    {
      title: "",
      items: text
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 2),
    },
  ];
}
