/** Плейсхолдеры в тексте после ИИ-генерации — подставляются локально, без отправки в модель. */
export const PII_PLACEHOLDERS = {
  fullName: "{{CLIENT_FULL_NAME}}",
  phone: "{{CLIENT_PHONE}}",
  email: "{{CLIENT_EMAIL}}",
} as const;

export const PII_FIELD_KEYS = ["fullName", "phone", "email"] as const;

export type PersonalDataFieldKey = (typeof PII_FIELD_KEYS)[number];

export const ENCRYPTED_PREFIX = "enc:v1:";
