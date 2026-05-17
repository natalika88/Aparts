import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { ENCRYPTED_PREFIX } from "./constants";
import type { PersonalDataBundle } from "./types";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const TAG_LEN = 16;

function encryptionKey(): Buffer {
  const raw = process.env.PERSONAL_DATA_ENCRYPTION_KEY?.trim();
  if (raw && raw.length >= 16) {
    return createHash("sha256").update(raw).digest();
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "PERSONAL_DATA_ENCRYPTION_KEY must be set in production (min. 16 characters).",
    );
  }
  const fallback = process.env.AUTH_SECRET ?? "pushkin-son-dev-personal-data-key";
  return createHash("sha256").update(fallback).digest();
}

export function encryptString(plaintext: string): string {
  if (!plaintext) return plaintext;
  const key = encryptionKey();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  const packed = Buffer.concat([iv, tag, encrypted]);
  return `${ENCRYPTED_PREFIX}${packed.toString("base64url")}`;
}

export function decryptString(value: string): string {
  if (!value.startsWith(ENCRYPTED_PREFIX)) return value;
  const key = encryptionKey();
  const packed = Buffer.from(value.slice(ENCRYPTED_PREFIX.length), "base64url");
  const iv = packed.subarray(0, IV_LEN);
  const tag = packed.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const encrypted = packed.subarray(IV_LEN + TAG_LEN);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

export function isEncryptedValue(value: string): boolean {
  return value.startsWith(ENCRYPTED_PREFIX);
}

export function encryptPersonalDataBundle(bundle: PersonalDataBundle): string {
  return encryptString(JSON.stringify(bundle));
}

export function decryptPersonalDataBundle(blob: string): PersonalDataBundle {
  const json = decryptString(blob);
  const parsed = JSON.parse(json) as PersonalDataBundle;
  return {
    fullName: parsed.fullName ?? "",
    phone: parsed.phone ?? "",
    email: parsed.email ?? "",
  };
}
