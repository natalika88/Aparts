import { PII_PLACEHOLDERS } from "./constants";
import type { PersonalDataBundle } from "./types";

/** Подставляет реальные ПДн в документ после ИИ-генерации (только на сервере). */
export function mergePersonalDataIntoDocument(
  template: string,
  personalData: PersonalDataBundle,
): string {
  return template
    .replaceAll(PII_PLACEHOLDERS.fullName, personalData.fullName)
    .replaceAll(PII_PLACEHOLDERS.phone, personalData.phone)
    .replaceAll(PII_PLACEHOLDERS.email, personalData.email);
}
