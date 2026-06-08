import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { usersService } from "./users.service";

export const usersController = {
  async me(req: AuthenticatedRequest, res: Response) {
    const user = await usersService.getById(req.user.id);
    res.json({ user });
  }
};

