import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" }
  });

  console.log("=== USER RECORDS IN DB ===");
  console.log(users.map(u => ({
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    role: u.role
  })));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
