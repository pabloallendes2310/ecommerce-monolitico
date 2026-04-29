import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { authMiddleware } from "./auth.middleware.js";

const router = Router();
const authController = new AuthController();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.me);

export default router;
