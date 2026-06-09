import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { usersService } from "./users.service";

export const usersController = {
  async me(req: AuthenticatedRequest, res: Response) {
    const user = await usersService.getById(req.user.id);
    res.json({ user });
  },

  async leaderboard(req: AuthenticatedRequest, res: Response) {
    const list = await usersService.getLeaderboard(req.user.id);
    res.json({ leaderboard: list });
  }
};


