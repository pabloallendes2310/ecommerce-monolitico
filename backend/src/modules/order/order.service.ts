import { prisma } from "../../lib/prisma.js";
import { CreateOrderDto } from "./dto.js";

export class OrderService {
  async createOrder(createOrderDto: CreateOrderDto) {
    const { userId, items } = createOrderDto;

    const itemsDb = await prisma.item.findMany({
      where: { id: { in: items.map((item) => item.itemId) } },
    });

    return await prisma.orders.create({
      data: {
        userId,
        state: "pending",
        items: {
          create: items.map((orderItem) => {
            const item = itemsDb.find(
              (dbItem) => dbItem.id === orderItem.itemId,
            );
            if (!item) throw new Error(`Item ${orderItem.itemId} no existe`);
            return {
              itemId: orderItem.itemId,
              quantity: orderItem.quantity,
              unitPrice: item.price,
            };
          }),
        },
      },
      include: {
        items: true,
      },
    });
  }
}
