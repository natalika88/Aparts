import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  parseISO,
  startOfDay,
} from "date-fns";
import { prisma } from "@/lib/prisma";
import { getPropertyBlockedDays } from "@/lib/property-blocked-days";

export type SearchStayParams = {
  checkIn: string;
  checkOut: string;
  guests: number;
  groupSlug?: string | null;
};

export type AvailablePropertyResult = {
  id: string;
  slug: string;
  publicName: string;
  guestsMax: number;
  basePricePerNight: number | null;
  groupName: string;
  groupSlug: string;
  coverPath: string | null;
  nights: number;
  stayTotal: number | null;
};

function isRangeFree(blocked: Set<string>, checkIn: Date, checkOut: Date): boolean {
  const lastNight = addDays(checkOut, -1);
  if (lastNight < checkIn) return false;

  for (const day of eachDayOfInterval({ start: checkIn, end: lastNight })) {
    if (blocked.has(format(day, "yyyy-MM-dd"))) return false;
  }
  return true;
}

export async function searchAvailableProperties(
  params: SearchStayParams,
): Promise<AvailablePropertyResult[]> {
  const checkIn = startOfDay(parseISO(params.checkIn));
  const checkOut = startOfDay(parseISO(params.checkOut));
  if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) return [];
  if (checkOut <= checkIn) return [];
  if (params.guests < 1) return [];

  const nights = differenceInCalendarDays(checkOut, checkIn);

  const properties = await prisma.property.findMany({
    where: {
      status: "PUBLISHED",
      guestsMax: { gte: params.guests },
      ...(params.groupSlug && params.groupSlug !== "all"
        ? { group: { slug: params.groupSlug } }
        : {}),
    },
    include: {
      group: { select: { name: true, slug: true } },
      media: {
        where: { mediaType: "image" },
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { filePath: true },
      },
    },
    orderBy: [{ groupId: "asc" }, { sortOrder: "asc" }],
  });

  const results: AvailablePropertyResult[] = [];

  for (const p of properties) {
    if (nights < p.minStayDefault) continue;

    const blocked = new Set(await getPropertyBlockedDays(p.id));
    if (!isRangeFree(blocked, checkIn, checkOut)) continue;

    const perNight = p.basePricePerNight ?? null;
    results.push({
      id: p.id,
      slug: p.slug,
      publicName: p.publicName,
      guestsMax: p.guestsMax,
      basePricePerNight: perNight,
      groupName: p.group.name,
      groupSlug: p.group.slug,
      coverPath: p.media[0]?.filePath ?? null,
      nights,
      stayTotal: perNight != null ? perNight * nights : null,
    });
  }

  return results;
}
