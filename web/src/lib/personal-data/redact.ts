import { PII_PLACEHOLDERS } from "./constants";
import type { PersonalDataBundle, DocumentGenerationContext, RedactedDocumentPayload } from "./types";

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /(?:\+7|8)[\s(-]*\d{3}[\s)-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}|\d{10,11}/g;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Заменяет известные ПДн в строке на плейсхолдеры. */
export function redactPersonalDataInText(text: string, pii?: PersonalDataBundle): string {
  let out = text;
  if (pii?.fullName && pii.fullName.length > 2) {
    out = out.replace(new RegExp(escapeRegExp(pii.fullName), "gi"), PII_PLACEHOLDERS.fullName);
  }
  if (pii?.phone && pii.phone.length >= 5) {
    out = out.replace(new RegExp(escapeRegExp(pii.phone), "g"), PII_PLACEHOLDERS.phone);
  }
  if (pii?.email) {
    out = out.replace(new RegExp(escapeRegExp(pii.email), "gi"), PII_PLACEHOLDERS.email);
  }
  out = out.replace(EMAIL_RE, PII_PLACEHOLDERS.email);
  out = out.replace(PHONE_RE, PII_PLACEHOLDERS.phone);
  return out;
}

export function buildRedactedPayload(
  context: DocumentGenerationContext,
  personalData: PersonalDataBundle,
): RedactedDocumentPayload {
  return {
    ...context,
    client: {
      fullName: PII_PLACEHOLDERS.fullName,
      phone: PII_PLACEHOLDERS.phone,
      email: PII_PLACEHOLDERS.email,
    },
  };
}

export function redactObjectForAi<T extends Record<string, unknown>>(
  value: T,
  personalData: PersonalDataBundle,
): T {
  const json = redactPersonalDataInText(JSON.stringify(value), personalData);
  return JSON.parse(json) as T;
}
