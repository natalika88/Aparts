import { generateDocumentBodyWithAi } from "@/lib/ai/generate-document-body";
import { encryptPersonalDataBundle } from "./crypto";
import { mergePersonalDataIntoDocument } from "./merge";
import { buildRedactedPayload, redactObjectForAi } from "./redact";
import type { DocumentGenerationContext, DocumentType, PersonalDataBundle } from "./types";
import { assertSafeForAi } from "./validate";

export type DocumentPipelineResult = {
  finalBody: string;
  aiBody: string;
  provider: "openai" | "template";
  piiEncrypted: string;
};

/**
 * Полный цикл: маскирование → ИИ (без ПДн) → подстановка ПДн в итоговый текст.
 */
export async function runDocumentGenerationPipeline(
  type: DocumentType,
  context: DocumentGenerationContext,
  personalData: PersonalDataBundle,
): Promise<DocumentPipelineResult> {
  const redactedPayload = buildRedactedPayload(context, personalData);
  const safeContext = redactObjectForAi(context, personalData);

  assertSafeForAi(safeContext, personalData);
  assertSafeForAi(redactedPayload, personalData);

  const { body: aiBody, provider } = await generateDocumentBodyWithAi(type, redactedPayload);

  assertSafeForAi(aiBody, personalData);

  const finalBody = mergePersonalDataIntoDocument(aiBody, personalData);

  return {
    finalBody,
    aiBody,
    provider,
    piiEncrypted: encryptPersonalDataBundle(personalData),
  };
}
