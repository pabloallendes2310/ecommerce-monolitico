import { PrismaClient } from "../generated/prisma/client";
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const assetsBaseUrl = process.env.ASSETS_BASE_URL?.replace(/\/$/, "");

function imageUrl(fileName: string, fallbackUrl: string) {
  return assetsBaseUrl ? `${assetsBaseUrl}/${fileName}` : fallbackUrl;
}

async function main() {
  await prisma.item.deleteMany();

  const items = await prisma.item.createMany({
    data: [
      {
        name: "Laptop HP",
        description: 'Laptop HP 15.6" con 8GB RAM y 256GB SSD',
        price: 450000,
        stock: 15,
        image_url: imageUrl(
          "laptop.jpg",
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
        ),
      },
      {
        name: "Mouse Logitech",
        description: "Mouse inalámbrico ergonómico",
        price: 25000,
        stock: 50,
        image_url: imageUrl(
          "mouse.jpg",
          "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=900&q=80",
        ),
      },
      {
        name: "Teclado Mecánico",
        description: "Teclado mecánico RGB gaming",
        price: 75000,
        stock: 30,
        image_url: imageUrl(
          "teclado.jpg",
          "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80",
        ),
      },
      {
        name: 'Monitor LG 24"',
        description: "Monitor Full HD IPS 24 pulgadas",
        price: 180000,
        stock: 20,
        image_url: imageUrl(
          "monitor.jpg",
          "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80",
        ),
      },
      {
        name: "Audífonos Sony",
        description: "Audífonos inalámbricos con cancelación de ruido",
        price: 120000,
        stock: 25,
        image_url: imageUrl(
          "audifonos.jpg",
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
        ),
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
