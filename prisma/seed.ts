import { PrismaClient, Tier } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create a demo user for testing
  const user = await prisma.user.upsert({
    where: { email: "demo@spriteforge.dev" },
    update: {},
    create: {
      email: "demo@spriteforge.dev",
      name: "Demo User",
      tier: Tier.PRO,
      provider: "github",
    },
  });

  console.log(`Seeded user: ${user.email} (${user.tier})`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
