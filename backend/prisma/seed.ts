import { PrismaClient } from "../generated/prisma/client";
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.item.deleteMany();

  const items = await prisma.item.createMany({
    data: [
      {
        name: "Laptop HP",
        description: 'Laptop HP 15.6" con 8GB RAM y 256GB SSD',
        price: 450000,
        stock: 15,
        image_url: "https://ecommerce-monolitico-aws-hmpjgb.s3.amazonaws.com/laptop.jpg",
      },
      {
        name: "Mouse Logitech",
        description: "Mouse inalámbrico ergonómico",
        price: 25000,
        stock: 50,
        image_url: "https://ecommerce-monolitico-aws-hmpjgb.s3.amazonaws.com/mouse.jpg",
      },
      {
        name: "Teclado Mecánico",
        description: "Teclado mecánico RGB gaming",
        price: 75000,
        stock: 30,
        image_url: "https://ecommerce-monolitico-aws-hmpjgb.s3.amazonaws.com/teclado.jpg",
      },
      {
        name: 'Monitor LG 24"',
        description: "Monitor Full HD IPS 24 pulgadas",
        price: 180000,
        stock: 20,
        image_url: "https://ecommerce-monolitico-aws-hmpjgb.s3.amazonaws.com/monitor.jpg",
      },
      {
        name: "Audífonos Sony",
        description: "Audífonos inalámbricos con cancelación de ruido",
        price: 120000,
        stock: 25,
        image_url: "https://ecommerce-monolitico-aws-hmpjgb.s3.amazonaws.com/audifonos.jpg",
      },
    ],
  });

  console.log(`se crearon ${items.count} items correctamente`);
}
main()
  .catch((e) => {
    console.log(e);
    console.error("error en la seed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });