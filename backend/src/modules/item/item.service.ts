import { prisma } from "../../lib/prisma.js";
export class ItemService {
  async getAllItems() {
    const items = await prisma.item.findMany();
    console.log(items);
    return items;
  }
  async getItemById(id: string) {
    const item = await prisma.item.findUnique({ where: { id } });
    console.log(item);
    return item;
  }
}
