import { Router } from "express";
import { OrderController } from "./order.controller.js";
import { authMiddleware } from "../auth/auth.middleware.js";
const router = Router();
const orderController = new OrderController();

router.post("/create", authMiddleware, orderController.createOrder);

export default router;
