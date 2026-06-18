import { PrismaClient } from "@prisma/client";

import { PLAN_CATALOG } from "@/lib/plans";

const prisma = new PrismaClient();

async function main() {
  for (const plan of PLAN_CATALOG) {
    await prisma.plan.upsert({
      where: { id: plan.id },
      update: {
        code: plan.code,
        name: plan.name,
        priceCents: plan.priceCents,
        currency: plan.currency,
        description: plan.description,
        featuresJson: JSON.stringify(plan.features),
        isActive: true
      },
      create: {
        id: plan.id,
        code: plan.code,
        name: plan.name,
        priceCents: plan.priceCents,
        currency: plan.currency,
        description: plan.description,
        featuresJson: JSON.stringify(plan.features),
        isActive: true
      }
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
