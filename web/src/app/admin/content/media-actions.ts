"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/auth/audit";
import { requireContentAccess } from "@/lib/auth/session";
import { photoPublicPath, resolvePropertyPhotoFolder } from "@/lib/property-photo";
import { prisma } from "@/lib/prisma";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 8 * 1024 * 1024;

function safeFilename(name: string): string {
  const ext = path.extname(name).toLowerCase().slice(0, 5);
  const base = path
    .basename(name, ext)
    .replace(/[^\w.-]+/g, "-")
    .slice(0, 80);
  return `${base || "photo"}-${Date.now()}${ext || ".jpg"}`;
}

function revalidatePropertyPaths(propertyId: string, slug: string) {
  revalidatePath("/admin/content/properties");
  revalidatePath(`/admin/content/properties/${propertyId}`);
  revalidatePath(`/apartments/${slug}`);
  revalidatePath("/apartments");
}

export async function uploadPropertyPhotos(propertyId: string, formData: FormData) {
  const session = await requireContentAccess();
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { media: { where: { mediaType: "image" }, orderBy: { sortOrder: "asc" } } },
  });
  if (!property) throw new Error("Property not found");

  const folder = resolvePropertyPhotoFolder(property.internalCode, property.media);
  const dir = path.join(process.cwd(), "public", "apartment-photos", String(folder));
  await fs.mkdir(dir, { recursive: true });

  const files = formData.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) throw new Error("Выберите файлы");

  let sortOrder = property.media.length;
  const created: string[] = [];

  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) continue;
    if (file.size > MAX_BYTES) continue;

    const filename = safeFilename(file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(dir, filename), buffer);

    const row = await prisma.propertyMedia.create({
      data: {
        propertyId,
        mediaType: "image",
        filePath: photoPublicPath(folder, filename),
        altText: property.publicName,
        sortOrder,
        isCover: property.media.length === 0 && sortOrder === 0,
      },
    });
    created.push(row.id);
    sortOrder++;
  }

  await writeAuditLog({
    userId: session.user.id,
    entityType: "Property",
    entityId: propertyId,
    action: "MEDIA_UPLOAD",
    after: { count: created.length, folder },
  });

  revalidatePropertyPaths(propertyId, property.slug);
  return { uploaded: created.length };
}

export async function deletePropertyMedia(propertyId: string, mediaId: string) {
  const session = await requireContentAccess();
  const media = await prisma.propertyMedia.findFirst({
    where: { id: mediaId, propertyId },
    include: { property: true },
  });
  if (!media) throw new Error("Not found");

  if (media.filePath?.startsWith("/apartment-photos/")) {
    const diskPath = path.join(process.cwd(), "public", media.filePath.replace(/^\//, ""));
    try {
      await fs.unlink(diskPath);
    } catch {
      /* file may be missing */
    }
  }

  await prisma.propertyMedia.delete({ where: { id: mediaId } });

  if (media.isCover) {
    const next = await prisma.propertyMedia.findFirst({
      where: { propertyId, mediaType: "image" },
      orderBy: { sortOrder: "asc" },
    });
    if (next) {
      await prisma.propertyMedia.update({ where: { id: next.id }, data: { isCover: true } });
    }
  }

  await writeAuditLog({
    userId: session.user.id,
    entityType: "PropertyMedia",
    entityId: mediaId,
    action: "DELETE",
  });

  revalidatePropertyPaths(propertyId, media.property.slug);
}

export async function setPropertyCover(propertyId: string, mediaId: string) {
  const session = await requireContentAccess();
  const media = await prisma.propertyMedia.findFirst({ where: { id: mediaId, propertyId } });
  if (!media) throw new Error("Not found");

  const property = await prisma.property.findUniqueOrThrow({ where: { id: propertyId } });

  await prisma.$transaction([
    prisma.propertyMedia.updateMany({ where: { propertyId }, data: { isCover: false } }),
    prisma.propertyMedia.update({ where: { id: mediaId }, data: { isCover: true } }),
  ]);

  await writeAuditLog({
    userId: session.user.id,
    entityType: "PropertyMedia",
    entityId: mediaId,
    action: "SET_COVER",
  });

  revalidatePropertyPaths(propertyId, property.slug);
}

export async function movePropertyMedia(propertyId: string, mediaId: string, direction: "up" | "down") {
  const session = await requireContentAccess();
  const items = await prisma.propertyMedia.findMany({
    where: { propertyId, mediaType: "image" },
    orderBy: { sortOrder: "asc" },
  });
  const idx = items.findIndex((i) => i.id === mediaId);
  if (idx < 0) throw new Error("Not found");
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= items.length) return;

  const a = items[idx]!;
  const b = items[swapIdx]!;
  await prisma.$transaction([
    prisma.propertyMedia.update({ where: { id: a.id }, data: { sortOrder: b.sortOrder } }),
    prisma.propertyMedia.update({ where: { id: b.id }, data: { sortOrder: a.sortOrder } }),
  ]);

  await writeAuditLog({
    userId: session.user.id,
    entityType: "Property",
    entityId: propertyId,
    action: "MEDIA_REORDER",
    after: { mediaId, direction },
  });

  const property = await prisma.property.findUniqueOrThrow({ where: { id: propertyId } });
  revalidatePropertyPaths(propertyId, property.slug);
}
