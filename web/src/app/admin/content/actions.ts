"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { writeAuditLog } from "@/lib/auth/audit";
import { requireContentAccess } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const propertySchema = z.object({
  publicName: z.string().min(2).max(200),
  publicNameEn: z.string().max(200).optional(),
  shortDescription: z.string().min(1).max(500),
  fullDescription: z.string().min(1),
  advantages: z.string().optional(),
  rules: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "HIDDEN"]),
  isFeatured: z.coerce.boolean().optional(),
});

const groupSchema = z.object({
  name: z.string().min(2).max(200),
  shortDescription: z.string().min(1).max(500),
  fullDescription: z.string().optional(),
});

export async function updatePropertyContent(propertyId: string, formData: FormData) {
  const session = await requireContentAccess();
  const parsed = propertySchema.parse({
    publicName: formData.get("publicName"),
    publicNameEn: formData.get("publicNameEn") || undefined,
    shortDescription: formData.get("shortDescription"),
    fullDescription: formData.get("fullDescription"),
    advantages: formData.get("advantages") || undefined,
    rules: formData.get("rules") || undefined,
    status: formData.get("status"),
    isFeatured: formData.get("isFeatured") === "on",
  });

  const before = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!before) throw new Error("Property not found");

  await prisma.property.update({
    where: { id: propertyId },
    data: parsed,
  });

  await writeAuditLog({
    userId: session.user.id,
    entityType: "Property",
    entityId: propertyId,
    action: "CONTENT_UPDATE",
    before: { publicName: before.publicName, status: before.status },
    after: { publicName: parsed.publicName, status: parsed.status },
  });

  revalidatePath("/admin/content/properties");
  revalidatePath(`/admin/content/properties/${propertyId}`);
  revalidatePath(`/apartments/${before.slug}`);
}

export async function updatePropertyGroup(groupId: string, formData: FormData) {
  const session = await requireContentAccess();
  const parsed = groupSchema.parse({
    name: formData.get("name"),
    shortDescription: formData.get("shortDescription"),
    fullDescription: formData.get("fullDescription") || undefined,
  });

  const before = await prisma.propertyGroup.findUnique({ where: { id: groupId } });
  if (!before) throw new Error("Group not found");

  await prisma.propertyGroup.update({
    where: { id: groupId },
    data: parsed,
  });

  await writeAuditLog({
    userId: session.user.id,
    entityType: "PropertyGroup",
    entityId: groupId,
    action: "CONTENT_UPDATE",
    before: { name: before.name },
    after: { name: parsed.name },
  });

  revalidatePath("/admin/content/groups");
  revalidatePath(`/admin/content/groups/${groupId}`);
  revalidatePath(`/addresses/${before.slug}`);
}
