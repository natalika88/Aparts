import type { DocumentType, RedactedDocumentPayload } from "@/lib/personal-data/types";
import { assertSafeForAi } from "@/lib/personal-data/validate";

type AiResult = { body: string; provider: "openai" | "template" };

function buildTemplateBody(type: DocumentType, payload: RedactedDocumentPayload): string {
  const client = payload.client;
  const lines: string[] = [];

  if (type === "brief") {
    lines.push(
      "БРИФ НА ПРОЖИВАНИЕ",
      "",
      `Гость: ${client.fullName}`,
      `Телефон: ${client.phone}`,
      `Email: ${client.email}`,
      "",
    );
    if (payload.propertyName) lines.push(`Объект: ${payload.propertyName}`);
    if (payload.propertyCode) lines.push(`Код: ${payload.propertyCode}`);
    if (payload.address) lines.push(`Адрес: ${payload.address}`);
    if (payload.checkIn && payload.checkOut) {
      lines.push(`Даты: ${payload.checkIn} — ${payload.checkOut} (${payload.nights ?? "—"} ноч.)`);
    }
    if (payload.guests) lines.push(`Гостей: ${payload.guests}`);
    if (payload.notes) lines.push("", "Пожелания:", payload.notes);
    lines.push(
      "",
      "Апартаменты «Пушкин сон» — уютное размещение в центре Санкт-Петербурга.",
    );
  } else {
    lines.push(
      "КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ",
      "",
      `Уважаемый(ая) ${client.fullName}!`,
      "",
      "Благодарим за интерес к апартаментам «Пушкин сон».",
      "",
    );
    if (payload.propertyName) lines.push(`Предлагаем: ${payload.propertyName}`);
    if (payload.checkIn && payload.checkOut) {
      lines.push(`Период: ${payload.checkIn} — ${payload.checkOut}`);
    }
    if (payload.totalPrice) {
      lines.push(`Ориентировочная стоимость: ${payload.totalPrice} ₽`);
    }
    lines.push(
      "",
      "Для подтверждения бронирования свяжитесь с нами:",
      `Тел.: ${client.phone}`,
      `Email: ${client.email}`,
      "",
      "С уважением, команда «Пушкин сон»",
    );
  }

  return lines.join("\n");
}

async function callOpenAi(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "Ты помощник отеля. Пиши по-русски, деловым тоном. В тексте клиента всегда используй только плейсхолдеры {{CLIENT_FULL_NAME}}, {{CLIENT_PHONE}}, {{CLIENT_EMAIL}} — никогда не выдумывай реальные контакты.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error: ${res.status} ${err}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Empty AI response");
  return content;
}

function buildAiPrompt(type: DocumentType, payload: RedactedDocumentPayload): string {
  const kind = type === "brief" ? "бриф на проживание" : "коммерческое предложение";
  return [
    `Составь ${kind} для апартаментов «Пушкин сон».`,
    "Данные клиента — только плейсхолдеры, не заменяй их:",
    `ФИО: ${payload.client.fullName}`,
    `Телефон: ${payload.client.phone}`,
    `Email: ${payload.client.email}`,
    "",
    "Контекст (без персональных данных):",
    JSON.stringify(
      {
        propertyName: payload.propertyName,
        propertyCode: payload.propertyCode,
        address: payload.address,
        checkIn: payload.checkIn,
        checkOut: payload.checkOut,
        nights: payload.nights,
        guests: payload.guests,
        pricePerNight: payload.pricePerNight,
        totalPrice: payload.totalPrice,
        notes: payload.notes,
      },
      null,
      2,
    ),
  ].join("\n");
}

/**
 * Генерирует тело документа с плейсхолдерами ПДн. Реальные контакты в prompt/API не передаются.
 */
export async function generateDocumentBodyWithAi(
  type: DocumentType,
  redactedPayload: RedactedDocumentPayload,
): Promise<AiResult> {
  assertSafeForAi(redactedPayload);

  const prompt = buildAiPrompt(type, redactedPayload);
  assertSafeForAi(prompt);

  if (process.env.OPENAI_API_KEY?.trim()) {
    const body = await callOpenAi(prompt);
    assertSafeForAi(body);
    return { body, provider: "openai" };
  }

  const body = buildTemplateBody(type, redactedPayload);
  return { body, provider: "template" };
}
