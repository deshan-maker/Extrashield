import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await hash("password123", 10);

  const shop = await prisma.shop.upsert({
    where: { id: "seed-shop-1" },
    update: {},
    create: {
      id: "seed-shop-1",
      name: "Perera Mobile World",
      location: "Kandy",
      verified: true,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@dwpcore.lk" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@dwpcore.lk",
      phone: "0770000000",
      passwordHash: password,
      role: "ADMIN",
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: "agent@dwpcore.lk" },
    update: {},
    create: {
      name: "Isuru Kodithuwakku",
      email: "agent@dwpcore.lk",
      phone: "0771111111",
      passwordHash: password,
      role: "AGENT",
      shopId: shop.id,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@dwpcore.lk" },
    update: {},
    create: {
      name: "Nadeesha Perera",
      email: "customer@dwpcore.lk",
      phone: "0772222222",
      passwordHash: password,
      role: "CUSTOMER",
    },
  });

  const callCenterStaff = await prisma.user.upsert({
    where: { email: "callcenter@dwpcore.lk" },
    update: {},
    create: {
      name: "Dilani Fernando",
      email: "callcenter@dwpcore.lk",
      phone: "0773333333",
      passwordHash: password,
      role: "CALL_CENTER",
    },
  });

  const device = await prisma.device.upsert({
    where: { imei: "356938035643809" },
    update: {},
    create: {
      imei: "356938035643809",
      brand: "Apple",
      model: "iPhone 15 Pro",
      value: 320000,
      condition: "NEW",
      customerId: customer.id,
      registeredById: agent.id,
      shopId: shop.id,
      warranty: {
        create: {
          tierLabel: "Elite Enterprise",
          price: 28990,
          status: "ACTIVE",
          expiresAt: new Date("2027-03-12"),
        },
      },
    },
  });

  console.log("Seed complete:");
  console.log({ admin: admin.email, agent: agent.email, customer: customer.email, device: device.imei });
  console.log("Password for all seed accounts: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
