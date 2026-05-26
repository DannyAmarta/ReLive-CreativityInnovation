import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const messages = await prisma.chatMessage.findMany({
    orderBy: { id: "desc" },
    take: 10,
  });
  console.log("LAST 10 MESSAGES:");
  console.log(JSON.stringify(messages, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
