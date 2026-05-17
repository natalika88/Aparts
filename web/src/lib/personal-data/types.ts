import type { PersonalDataFieldKey } from "./constants";

export type PersonalDataBundle = Record<PersonalDataFieldKey, string>;

export type DocumentType = "brief" | "commercial_proposal";

/** Контекст для ИИ — только несущие поля (объект, даты, условия). */
export type DocumentGenerationContext = {
  locale?: "ru" | "en";
  propertyName?: string;
  propertyCode?: string;
  address?: string;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  guests?: number;
  pricePerNight?: number;
  totalPrice?: number;
  notes?: string;
};

export type RedactedDocumentPayload = DocumentGenerationContext & {
  client: {
    fullName: string;
    phone: string;
    email: string;
  };
};
