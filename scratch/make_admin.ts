import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "testuser_88776655@proofme.com";
  
  // Find the user
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.log(`User ${email} not found!`);
    return;
  }

  console.log(`Current user details:`, {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role
  });

  if (user.role !== "ADMIN") {
    console.log(`Updating role to ADMIN...`);
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { role: "ADMIN" }
    });
    console.log(`Updated successfully:`, {
      id: updated.id,
      email: updated.email,
      role: updated.role
    });
  } else {
    console.log(`User already has ADMIN role.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
