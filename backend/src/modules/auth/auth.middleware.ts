import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../../lib/jwt.js";
import { UserRepository } from "../users/user.repository.js";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No autorizado" });
    }
    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    const useRepo = new UserRepository();
    const user = await useRepo.findById(payload.userId);
    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }
    (req as any).user = {
      id: user.id,
      email: user.email,
      name: user.name,
    };
    next();
  } catch (error) {
    res.status(401).json({ error: "Token invalido" });
  }
};
