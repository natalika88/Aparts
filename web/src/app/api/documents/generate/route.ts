import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  PersonalDataLeakError,
  runDocumentGenerationPipeline,
  type DocumentType,
} from "@/lib/personal-data";

const bodySchema = z.object({
  type: z.enum(["brief", "commercial_proposal"]),
  personalData: z.object({
    fullName: z.string().min(2).max(120),
    phone: z.string().min(5).max(40),
    email: z.string().email().max(120),
  }),
  context: z
    .object({
      locale: z.enum(["ru", "en"]).optional(),
      propertyName: z.string().max(200).optional(),
      propertyCode: z.string().max(40).optional(),
      address: z.string().max(300).optional(),
      checkIn: z.string().max(40).optional(),
      checkOut: z.string().max(40).optional(),
      nights: z.number().int().positive().optional(),
      guests: z.number().int().positive().optional(),
      pricePerNight: z.number().int().nonnegative().optional(),
      totalPrice: z.number().int().nonnegative().optional(),
      notes: z.string().max(2000).optional(),
    })
    .optional(),
  bookingId: z.string().optional(),
});

function authorizeInternal(req: Request): boolean {
  const secret = process.env.INTERNAL_API_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV !== "production";
  return req.headers.get("x-internal-secret") === secret;
}

export async function POST(req: Request) {
  if (!authorizeInternal(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const { type, personalData, context, bookingId } = parsed.data;

  try {
    const result = await runDocumentGenerationPipeline(
      type as DocumentType,
      context ?? {},
      personalData,
    );

    const log = await prisma.documentGeneration.create({
      data: {
        documentType: type === "brief" ? "BRIEF" : "COMMERCIAL_PROPOSAL",
        status: "COMPLETED",
        contextJson: JSON.stringify(context ?? {}),
        piiEncrypted: result.piiEncrypted,
        aiOutput: result.aiBody,
        finalOutput: result.finalBody,
        aiProvider: result.provider,
        piiSentToAi: false,
        bookingId: bookingId ?? null,
      },
    });

    return NextResponse.json({
      id: log.id,
      finalBody: result.finalBody,
      provider: result.provider,
      piiSentToAi: false,
    });
  } catch (e) {
    if (e instanceof PersonalDataLeakError) {
      return NextResponse.json({ error: e.message }, { status: 422 });
    }
    console.error("[documents/generate]", e);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
