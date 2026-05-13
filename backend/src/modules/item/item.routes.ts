import { Router } from "express";
import { ItemController } from "./item.controller.js";
const router = Router();
const itemController = new ItemController();

router.get("", itemController.getAll);
router.get("/:id", itemController.getById);

export default router;
