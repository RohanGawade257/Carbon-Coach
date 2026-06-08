import dotenv from "dotenv";
import { prisma } from "../src/config/prisma";
import { ensureDemoData } from "../src/modules/demo/demo.service";

dotenv.config();

async function main() {
  await ensureDemoData();
  console.log("Seeded Carbon Coach categories, factors, challenges, badges, and demo account.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

