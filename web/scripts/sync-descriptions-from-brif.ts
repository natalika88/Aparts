/**
 * Синхронизирует описания квартир из tools/brif-plain-utf8.txt в БД.
 * Запуск: npm run descriptions:sync
 */
import { PrismaClient } from "@prisma/client";
import { loadBrifDescriptions } from "./brif-description-parser";

const prisma = new PrismaClient();

async function main() {
  const parsed = loadBrifDescriptions();
  console.log(`Parsed ${parsed.length} objects from brief.\n`);

  let updated = 0;
  let missing = 0;

  for (const item of parsed) {
    const result = await prisma.property.updateMany({
      where: { internalCode: item.internalCode },
      data: {
        shortDescription: item.shortDescription,
        shortDescriptionEn: item.shortDescriptionEn,
        fullDescription: item.fullDescription,
        fullDescriptionEn: item.fullDescriptionEn,
        advantages: item.advantages,
        rules: item.rules,
      },
    });

    if (result.count === 0) {
      console.warn(`  ⚠ Not found: ${item.internalCode}`);
      missing++;
    } else {
      console.log(`  ✓ ${item.internalCode}`);
      updated += result.count;
    }
  }

  console.log(`\nDone: ${updated} properties updated, ${missing} codes not in DB.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
