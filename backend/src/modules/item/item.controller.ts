import { json } from "node:stream/consumers";
import { ItemService } from "./item.service.js";
import { Request, Response } from "express";
export class ItemController {
  private itemService = new ItemService();

  getAll = async (req: Request, res: Response) => {
    try {
      const result = await this.itemService.getAllItems();
      res.status(200).json(result);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  };
  getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await this.itemService.getItemById(id as string);
      res.status(200).json(result);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  };
}
