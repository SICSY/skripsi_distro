import { Prisma, PrismaClient } from "@/src/generated/prisma";

const prisma = new PrismaClient();
const userData: Prisma.UserCreateInput[] = [
  {
    name: "User 1",
    email: "VhjyT@example.com",
    role: "MEMBER"
  }
];

export async function main() {
  for (const u of userData) {
    await prisma.user.create({ data: u });
  }
}
main();
