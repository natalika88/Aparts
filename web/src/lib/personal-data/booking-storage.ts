import { decryptString, encryptString, isEncryptedValue } from "./crypto";
import type { PersonalDataBundle } from "./types";

export type BookingPersonalFields = {
  guestName: string;
  guestPhone: string;
  guestEmail: string;
};

export function encryptBookingPersonalFields(fields: BookingPersonalFields): BookingPersonalFields {
  return {
    guestName: encryptString(fields.guestName.trim()),
    guestPhone: encryptString(fields.guestPhone.trim()),
    guestEmail: encryptString(fields.guestEmail.trim().toLowerCase()),
  };
}

export function decryptBookingPersonalFields(fields: BookingPersonalFields): BookingPersonalFields {
  return {
    guestName: isEncryptedValue(fields.guestName) ? decryptString(fields.guestName) : fields.guestName,
    guestPhone: isEncryptedValue(fields.guestPhone)
      ? decryptString(fields.guestPhone)
      : fields.guestPhone,
    guestEmail: isEncryptedValue(fields.guestEmail)
      ? decryptString(fields.guestEmail)
      : fields.guestEmail,
  };
}

export function bookingFieldsToPersonalBundle(fields: BookingPersonalFields): PersonalDataBundle {
  const decrypted = decryptBookingPersonalFields(fields);
  return {
    fullName: decrypted.guestName,
    phone: decrypted.guestPhone,
    email: decrypted.guestEmail,
  };
}
