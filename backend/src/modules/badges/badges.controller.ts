import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { badgesService } from "./badges.service";

export const badgesController = {
  async getMine(req: AuthenticatedRequest, res: Response) {
    const badges = await badgesService.getMine(req.user.id);
    res.json({ badges });
  }
};

