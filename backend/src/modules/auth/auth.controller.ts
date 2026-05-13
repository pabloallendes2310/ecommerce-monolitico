import { AuthService } from "./auth.service.js";
import type { Request, Response } from "express";
export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response) => {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };
  login = async (req: Request, res: Response) => {
    try {
      const result = await this.authService.login(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };
  me = async (req: Request, res: Response) => {
    res.json({ user: (req as any).user });
  };
}
