import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { GROUP_COORDS_BY_SLUG } from "../src/lib/yandex-map";

const prisma = new PrismaClient();

async function main() {
  for (const [slug, { lat, lng }] of Object.entries(GROUP_COORDS_BY_SLUG)) {
    const updated = await prisma.propertyGroup.updateMany({
      where: { slug },
      data: { latitude: lat, longitude: lng },
    });
    if (updated.count > 0) {
      console.log(`OK ${slug}: ${lat}, ${lng}`);
    } else {
      console.warn(`Пропуск ${slug}: группа не найдена в БД`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
