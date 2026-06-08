import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { authService } from "./auth.service";

export const authController = {
  async register(req: AuthenticatedRequest, res: Response) {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  },

  async login(req: AuthenticatedRequest, res: Response) {
    const result = await authService.login(req.body);
    res.json(result);
  },

  async logout(_req: AuthenticatedRequest, res: Response) {
    res.json({ success: true });
  },

  async me(req: AuthenticatedRequest, res: Response) {
    const user = await authService.me(req.user.id);
    res.json({ user });
  }
};

