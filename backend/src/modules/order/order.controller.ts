import { OrderService } from "./order.service.js";
import { Response, Request } from "express";
export class OrderController {
  private orderService = new OrderService();

  createOrder = async (req: Request, res: Response) => {
    try {
      const userId: number = (req as any).user.id;
      const items = req.body;
      if (!items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({
          message: "El carro no puedo estar vacio",
        });
      }
      console.log(userId);
      const result = await this.orderService.createOrder({ userId, items });
      return res.status(201).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error interno" });
    }
  };
}
