import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

const BRAND_RU = "Пушкин сон";
const BRAND_EN = "Pushkin Son";

function replaceBrand(text: string): string {
  return text
    .replace(/Two Steps/g, BRAND_RU)
    .replace(/two steps/gi, BRAND_RU)
    .replace(/twosteps/gi, "pushkinson");
}

async function main() {
  const groups = await p.propertyGroup.findMany();
  for (const g of groups) {
    await p.propertyGroup.update({
      where: { id: g.id },
      data: {
        metaTitle: g.metaTitle ? replaceBrand(g.metaTitle) : g.metaTitle,
        metaDescription: g.metaDescription ? replaceBrand(g.metaDescription) : g.metaDescription,
      },
    });
  }

  const properties = await p.property.findMany();
  for (const prop of properties) {
    await p.property.update({
      where: { id: prop.id },
      data: {
        fullDescription: prop.fullDescription ? replaceBrand(prop.fullDescription) : prop.fullDescription,
        fullDescriptionEn: prop.fullDescriptionEn
          ? prop.fullDescriptionEn.replace(/Two Steps/g, BRAND_EN).replace(/two steps/gi, BRAND_EN)
          : prop.fullDescriptionEn,
      },
    });
  }

  const users = await p.user.findMany();
  for (const u of users) {
    if (u.email.includes("twosteps")) {
      await p.user.update({
        where: { id: u.id },
        data: { email: u.email.replace(/twosteps/gi, "pushkinson") },
      });
    }
  }

  console.log(`Updated ${groups.length} groups, ${properties.length} properties, ${users.length} users checked.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
