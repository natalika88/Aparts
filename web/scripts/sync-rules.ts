/**
 * Обновляет поле rules у всех объектов компактным текстом.
 * Запуск: npx tsx scripts/sync-rules.ts
 */
import { PrismaClient } from "@prisma/client";
import { COMPACT_PROPERTY_RULES_RU } from "../src/lib/property-rules";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.property.updateMany({
    data: { rules: COMPACT_PROPERTY_RULES_RU },
  });
  console.log(`Updated rules for ${result.count} properties.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
