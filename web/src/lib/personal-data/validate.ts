import type { PersonalDataBundle } from "./types";
import { redactPersonalDataInText } from "./redact";

export class PersonalDataLeakError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PersonalDataLeakError";
  }
}

/** Проверяет, что в payload для ИИ нет «сырых» ПДн (только плейсхолдеры). */
export function assertSafeForAi(
  payload: string | Record<string, unknown>,
  knownPii?: PersonalDataBundle,
): void {
  const text = typeof payload === "string" ? payload : JSON.stringify(payload);

  if (knownPii) {
    const checks: [string | undefined, string][] = [
      [knownPii.fullName, "ФИО"],
      [knownPii.phone, "телефон"],
      [knownPii.email, "email"],
    ];
    for (const [value, label] of checks) {
      if (value && value.length > 2 && text.includes(value)) {
        throw new PersonalDataLeakError(
          `Обнаружены персональные данные (${label}) в запросе к ИИ. Генерация остановлена.`,
        );
      }
    }
  }

  const redacted = redactPersonalDataInText(text, knownPii);
  if (redacted !== text) {
    throw new PersonalDataLeakError(
      "В запросе к ИИ обнаружены контактные данные. Используйте только плейсхолдеры.",
    );
  }

}
