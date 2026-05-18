import "dotenv/config";
import bcrypt from "bcryptjs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import {
  listPublicPhotos,
  photoPublicPath,
  syncApartPhotoFolders,
} from "./photo-sync";
import { syncBrandLogo } from "./brand-logo-sync";
import { loadBrifDescriptions } from "../scripts/brif-description-parser";
import { COMPACT_PROPERTY_RULES_RU } from "../src/lib/property-rules";

const prisma = new PrismaClient();

const PASS = "ChangeMe!123";

async function main() {
  const passwordHash = await bcrypt.hash(PASS, 10);

  await prisma.user.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.propertyAvailability.deleteMany();
  await prisma.propertyPrice.deleteMany();
  await prisma.propertyMedia.deleteMany();
  await prisma.propertyAmenity.deleteMany();
  await prisma.property.deleteMany();
  await prisma.propertyGroup.deleteMany();
  await prisma.amenity.deleteMany();

  await prisma.user.createMany({
    data: [
      {
        email: "super@pushkinson.local",
        passwordHash,
        name: "Super Admin",
        role: "SUPERADMIN",
      },
      {
        email: "price@pushkinson.local",
        passwordHash,
        name: "Price Admin",
        role: "PRICE_ADMIN",
      },
      {
        email: "content@pushkinson.local",
        passwordHash,
        name: "Content Admin",
        role: "CONTENT_ADMIN",
      },
    ],
  });

  const amenityNames = [
    ["Wi‑Fi", "Wi‑Fi"],
    ["Кухня", "Kitchen"],
    ["Стиральная машина", "Washing machine"],
    ["Посудомоечная машина", "Dishwasher"],
    ["Кондиционер", "Air conditioning"],
    ["Телевизор", "TV"],
    ["Фен", "Hair dryer"],
    ["Утюг", "Iron"],
    ["Постельное бельё", "Bed linen"],
    ["Можно с детьми", "Child-friendly"],
    ["Можно с питомцем", "Pet-friendly"],
    ["Бесконтактное заселение", "Self check-in"],
  ];
  const amenities = await prisma.$transaction(
    amenityNames.map(([name, nameEn], i) =>
      prisma.amenity.create({
        data: { name, nameEn, sortOrder: i, isActive: true },
      }),
    ),
  );

  const webRoot = path.resolve(__dirname, "..");
  if (syncBrandLogo(webRoot)) {
    console.log("Логотип скопирован → public/brand/");
  } else {
    console.warn("Логотип не найден: положите файл в папку «Логотип» или «логотип» рядом с web.");
  }

  const syncPhotos = syncApartPhotoFolders(webRoot);
  if (syncPhotos.skipped) {
    console.warn(syncPhotos.skipped);
  } else {
    console.log(`Фото: скопировано ${syncPhotos.copied} файлов → public/apartment-photos/`);
  }

  const gNek = await prisma.propertyGroup.create({
    data: {
      slug: "nekrasova",
      name: "ул. Некрасова, 58",
      nameEn: "58 Nekrasov St.",
      district: "Центральный",
      fullAddress: "Санкт-Петербург, Центральный район, ул. Некрасова, 58",
      latitude: 59.938509,
      longitude: 30.367503,
      shortDescription:
        "Просторные апартаменты у Площади Восстания и Московского вокзала.",
      shortDescriptionEn: "Spacious apartments near Ploshchad Vosstaniya.",
      sortOrder: 1,
      isActive: true,
      metaTitle: "Пушкин сон — Некрасова 58",
      metaDescription: "Апартаменты «Пушкин сон» на Некрасова, Санкт-Петербург.",
    },
  });

  const gPes = await prisma.propertyGroup.create({
    data: {
      slug: "pestelya",
      name: "ул. Пестеля, 5",
      nameEn: "5 Pestelya St.",
      district: "Центральный",
      fullAddress: "Санкт-Петербург, ул. Пестеля, 5",
      latitude: 59.941912,
      longitude: 30.340814,
      shortDescription: "Исторический центр, тихие дворы, студии и апартаменты.",
      shortDescriptionEn: "Historic centre, quiet courtyards, studios.",
      sortOrder: 2,
      isActive: true,
      metaTitle: "Пушкин сон — Пестеля 5",
      metaDescription: "Апартаменты «Пушкин сон» на Пестеля.",
    },
  });

  const gNev = await prisma.propertyGroup.create({
    data: {
      slug: "nevskiy",
      name: "Невский проспект, 128",
      nameEn: "128 Nevsky Prospect",
      district: "Центральный",
      fullAddress: "Санкт-Петербург, Невский пр-т, 128",
      latitude: 59.930624,
      longitude: 30.366398,
      shortDescription: "На главной магистрали города.",
      shortDescriptionEn: "On the city’s main avenue.",
      sortOrder: 3,
      isActive: true,
      metaTitle: "Пушкин сон — Невский 128",
      metaDescription: "Апартаменты «Пушкин сон» на Невском.",
    },
  });

  const gVas = await prisma.propertyGroup.create({
    data: {
      slug: "vasilevskiy",
      name: "8-я линия Васильевского острова, 15",
      nameEn: "Vasilyevsky Island, 15 Line 8",
      district: "Василеостровский",
      fullAddress: "Санкт-Петербург, 8-я линия Васильевского острова, 15",
      latitude: 59.937607,
      longitude: 30.28202,
      shortDescription: "Васильевский остров, спокойная локация.",
      shortDescriptionEn: "Vasilyevsky Island, calm location.",
      sortOrder: 4,
      isActive: true,
      metaTitle: "Пушкин сон — Васильевский остров",
      metaDescription: "Апартаменты «Пушкин сон» на В.О.",
    },
  });

  type SeedProp = {
    code: string;
    slug: string;
    groupId: string;
    publicName: string;
    publicNameEn: string;
    type: string;
    rooms: number;
    area: number;
    guests: number;
    basePrice: number;
    avito?: string;
    /** Номер папки в «Apart photo» (1 … 19) */
    photoFolder: number;
  };

  const props: SeedProp[] = [
    {
      code: "NKR-01",
      slug: "nek-01-3k-105",
      groupId: gNek.id,
      publicName: "3-к. квартира, 105 м², 5 кроватей",
      publicNameEn: "3-room, 105 m², 5 beds",
      type: "THREE_ROOM",
      rooms: 3,
      area: 105,
      guests: 10,
      basePrice: 13190,
      photoFolder: 1,
      avito:
        "https://www.avito.ru/sankt-peterburg/kvartiry/3-k._kvartira_105_m_5_krovatey_4572907536",
    },
    {
      code: "NKR-02",
      slug: "nek-02-studio-26",
      groupId: gNek.id,
      publicName: "Квартира-студия, 26 м², 3 кровати",
      publicNameEn: "Studio, 26 m², 3 beds",
      type: "STUDIO",
      rooms: 0,
      area: 26,
      guests: 4,
      basePrice: 4500,
      photoFolder: 2,
      avito:
        "https://www.avito.ru/sankt-peterburg/kvartiry/kvartira-studiya_26_m_3_krovati_7964827868",
    },
    {
      code: "NKR-03",
      slug: "nek-03-studio-25",
      groupId: gNek.id,
      publicName: "Квартира-студия, 25 м², 3 кровати",
      publicNameEn: "Studio, 25 m², 3 beds",
      type: "STUDIO",
      rooms: 0,
      area: 25,
      guests: 4,
      basePrice: 4000,
      photoFolder: 3,
      avito:
        "https://www.avito.ru/sankt-peterburg/kvartiry/kvartira-studiya_25_m_3_krovati_4125513359",
    },
    {
      code: "NKR-04",
      slug: "nek-04-studio-37",
      groupId: gNek.id,
      publicName: "Квартира-студия, 37 м², 2 кровати",
      publicNameEn: "Studio, 37 m², 2 beds",
      type: "STUDIO",
      rooms: 0,
      area: 37,
      guests: 4,
      basePrice: 4500,
      photoFolder: 4,
      avito:
        "https://www.avito.ru/sankt-peterburg/kvartiry/kvartira-studiya_37_m_2_krovati_4124896320",
    },
    {
      code: "NKR-05",
      slug: "nek-05-studio-20",
      groupId: gNek.id,
      publicName: "Квартира-студия, 20 м², 2 кровати",
      publicNameEn: "Studio, 20 m², 2 beds",
      type: "STUDIO",
      rooms: 0,
      area: 20,
      guests: 4,
      basePrice: 3800,
      photoFolder: 5,
      avito:
        "https://www.avito.ru/sankt-peterburg/kvartiry/kvartira-studiya_20_m_2_krovati_4124909499",
    },
    {
      code: "PES-01",
      slug: "pes-01-studio-28",
      groupId: gPes.id,
      publicName: "Квартира-студия, 28 м², 2 кровати",
      publicNameEn: "Studio, 28 m², 2 beds",
      type: "STUDIO",
      rooms: 0,
      area: 28,
      guests: 4,
      basePrice: 4000,
      photoFolder: 6,
      avito:
        "https://www.avito.ru/sankt-peterburg/kvartiry/kvartira-studiya_28_m_2_krovati_943184749",
    },
    {
      code: "PES-02",
      slug: "pes-02-studio-22",
      groupId: gPes.id,
      publicName: "Квартира-студия, 22 м², 2 кровати",
      publicNameEn: "Studio, 22 m², 2 beds",
      type: "STUDIO",
      rooms: 0,
      area: 22,
      guests: 4,
      basePrice: 3500,
      photoFolder: 7,
      avito:
        "https://www.avito.ru/sankt-peterburg/kvartiry/kvartira-studiya_22_m_2_krovati_1430247052",
    },
    {
      code: "PES-03",
      slug: "pes-03-studio-14",
      groupId: gPes.id,
      publicName: "Квартира-студия, 14 м², 1 кровать",
      publicNameEn: "Studio, 14 m², 1 bed",
      type: "STUDIO",
      rooms: 0,
      area: 14,
      guests: 2,
      basePrice: 2800,
      photoFolder: 8,
      avito:
        "https://www.avito.ru/sankt-peterburg/kvartiry/kvartira-studiya_14_m_1_krovat_2364971952",
    },
    {
      code: "PES-04",
      slug: "pes-04-1k-36",
      groupId: gPes.id,
      publicName: "1-к. квартира, 36 м², 2 кровати",
      publicNameEn: "1-room, 36 m², 2 beds",
      type: "ONE_ROOM",
      rooms: 1,
      area: 36,
      guests: 4,
      basePrice: 4500,
      photoFolder: 9,
      avito:
        "https://www.avito.ru/sankt-peterburg/kvartiry/1-k._kvartira_36_m_2_krovati_3901084921",
    },
    {
      code: "PES-05",
      slug: "pes-05-studio-25",
      groupId: gPes.id,
      publicName: "Квартира-студия, 25 м², 2 кровати",
      publicNameEn: "Studio, 25 m², 2 beds",
      type: "STUDIO",
      rooms: 0,
      area: 25,
      guests: 4,
      basePrice: 4000,
      photoFolder: 10,
      avito:
        "https://www.avito.ru/sankt-peterburg/kvartiry/kvartira-studiya_25_m_2_krovati_3421312021",
    },
    {
      code: "PES-06",
      slug: "pes-06-studio-16",
      groupId: gPes.id,
      publicName: "Квартира-студия, 16 м², 1 кровать",
      publicNameEn: "Studio, 16 m², 1 bed",
      type: "STUDIO",
      rooms: 0,
      area: 16,
      guests: 2,
      basePrice: 4500,
      photoFolder: 11,
      avito:
        "https://www.avito.ru/sankt-peterburg/kvartiry/kvartira-studiya_16_m_1_krovat_1028601520",
    },
    {
      code: "PES-07",
      slug: "pes-07-studio-30a",
      groupId: gPes.id,
      publicName: "Квартира-студия, 30 м², 2 кровати (А)",
      publicNameEn: "Studio, 30 m², 2 beds (A)",
      type: "STUDIO",
      rooms: 0,
      area: 30,
      guests: 4,
      basePrice: 4000,
      photoFolder: 12,
      avito:
        "https://www.avito.ru/sankt-peterburg/kvartiry/kvartira-studiya_30_m_2_krovati_1160858716",
    },
    {
      code: "PES-08",
      slug: "pes-08-studio-30b",
      groupId: gPes.id,
      publicName: "Квартира-студия, 30 м², 2 кровати (Б)",
      publicNameEn: "Studio, 30 m², 2 beds (B)",
      type: "STUDIO",
      rooms: 0,
      area: 30,
      guests: 4,
      basePrice: 4000,
      photoFolder: 13,
      avito:
        "https://www.avito.ru/sankt-peterburg/kvartiry/kvartira-studiya_30_m_2_krovati_1219755096",
    },
    {
      code: "NEV-01",
      slug: "nev-01-studio-27",
      groupId: gNev.id,
      publicName: "Квартира-студия, 27 м², 2 кровати",
      publicNameEn: "Studio, 27 m², 2 beds",
      type: "STUDIO",
      rooms: 0,
      area: 27,
      guests: 4,
      basePrice: 4000,
      photoFolder: 14,
      avito:
        "https://www.avito.ru/sankt-peterburg/kvartiry/kvartira-studiya_27_m_2_krovati_1463167425",
    },
    {
      code: "NEV-02",
      slug: "nev-02-studio-14a",
      groupId: gNev.id,
      publicName: "Квартира-студия, 14 м², 1 кровать (А)",
      publicNameEn: "Studio, 14 m², 1 bed (A)",
      type: "STUDIO",
      rooms: 0,
      area: 14,
      guests: 2,
      basePrice: 2700,
      photoFolder: 15,
      avito:
        "https://www.avito.ru/sankt-peterburg/kvartiry/kvartira-studiya_14_m_1_krovat_2973161353",
    },
    {
      code: "NEV-03",
      slug: "nev-03-studio-14b",
      groupId: gNev.id,
      publicName: "Квартира-студия, 14 м², 1 кровать (Б)",
      publicNameEn: "Studio, 14 m², 1 bed (B)",
      type: "STUDIO",
      rooms: 0,
      area: 14,
      guests: 2,
      basePrice: 2500,
      photoFolder: 16,
      avito:
        "https://www.avito.ru/sankt-peterburg/kvartiry/kvartira-studiya_14_m_1_krovat_2077580666",
    },
    {
      code: "NEV-04",
      slug: "nev-04-studio-14v",
      groupId: gNev.id,
      publicName: "Квартира-студия, 14 м², 1 кровать (В)",
      publicNameEn: "Studio, 14 m², 1 bed (C)",
      type: "STUDIO",
      rooms: 0,
      area: 14,
      guests: 2,
      basePrice: 2700,
      photoFolder: 17,
      avito:
        "https://www.avito.ru/sankt-peterburg/kvartiry/kvartira-studiya_14_m_1_krovat_981361090",
    },
    {
      code: "VAS-01",
      slug: "vas-01-1k-33",
      groupId: gVas.id,
      publicName: "1-к. квартира, 33 м², 3 кровати",
      publicNameEn: "1-room, 33 m², 3 beds",
      type: "ONE_ROOM",
      rooms: 1,
      area: 33,
      guests: 4,
      basePrice: 4000,
      photoFolder: 18,
      avito:
        "https://www.avito.ru/sankt-peterburg/kvartiry/1-k._kvartira_33_m_3_krovati_3325625432",
    },
    {
      code: "VAS-02",
      slug: "vas-02-2k-55",
      groupId: gVas.id,
      publicName: "2-к. квартира, 55 м², 3 кровати",
      publicNameEn: "2-room, 55 m², 3 beds",
      type: "TWO_ROOM",
      rooms: 2,
      area: 55,
      guests: 6,
      basePrice: 5000,
      photoFolder: 19,
      avito:
        "https://www.avito.ru/sankt-peterburg/kvartiry/2-k._kvartira_55_m_3_krovati_2237568848",
    },
  ];

  const pickAmenities = (ids: number[]) =>
    ids.map((i) => ({ amenityId: amenities[i]!.id }));

  for (const p of props) {
    const created = await prisma.property.create({
      data: {
        groupId: p.groupId,
        slug: p.slug,
        internalCode: p.code,
        publicName: p.publicName,
        publicNameEn: p.publicNameEn,
        district: "Санкт-Петербург",
        fullAddress: (
          await prisma.propertyGroup.findUniqueOrThrow({
            where: { id: p.groupId },
          })
        ).fullAddress,
        avitoListingUrl: p.avito,
        roomsCount: p.rooms,
        propertyType: p.type,
        areaSqm: p.area,
        guestsMax: p.guests,
        shortDescription: p.publicName,
        shortDescriptionEn: p.publicNameEn,
        fullDescription: `${p.publicName}. Уютные апартаменты «Пушкин сон» в центре Санкт-Петербурга.`,
        fullDescriptionEn: `${p.publicNameEn}. Pushkin Son — boutique apartments in central Saint Petersburg.`,
        rules: COMPACT_PROPERTY_RULES_RU,
        basePricePerNight: p.basePrice,
        minStayDefault: 1,
        status: "PUBLISHED",
        isFeatured: p.code === "NKR-01",
        amenities: {
          create: pickAmenities([0, 1, 2, 8, 9, 10]),
        },
      },
    });

    const photoFiles = listPublicPhotos(webRoot, p.photoFolder);
    let sortOrder = 0;
    for (const file of photoFiles) {
      await prisma.propertyMedia.create({
        data: {
          propertyId: created.id,
          mediaType: "image",
          filePath: photoPublicPath(p.photoFolder, file),
          altText: p.publicName,
          sortOrder,
          isCover: sortOrder === 0,
        },
      });
      sortOrder++;
    }

    const today = new Date();
    for (let m = 0; m < 3; m++) {
      const start = new Date(today.getFullYear(), today.getMonth() + m, 1);
      const end = new Date(today.getFullYear(), today.getMonth() + m + 1, 0);
      await prisma.propertyPrice.create({
        data: {
          propertyId: created.id,
          dateStart: start,
          dateEnd: end,
          pricePerNight: p.basePrice,
          weekendPrice: Math.round(p.basePrice * 1.15),
          minStay: 1,
        },
      });
    }
  }

  for (const d of loadBrifDescriptions()) {
    await prisma.property.updateMany({
      where: { internalCode: d.internalCode },
      data: {
        shortDescription: d.shortDescription,
        shortDescriptionEn: d.shortDescriptionEn,
        fullDescription: d.fullDescription,
        fullDescriptionEn: d.fullDescriptionEn,
        advantages: d.advantages,
        rules: d.rules,
      },
    });
  }

  console.log("Seed OK. Вход в админку:");
  console.log("  super@pushkinson.local / price@ / content@ — пароль:", PASS);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
