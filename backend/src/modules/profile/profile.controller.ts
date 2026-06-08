import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { profileService } from "./profile.service";

export const profileController = {
  async get(req: AuthenticatedRequest, res: Response) {
    const profile = await profileService.get(req.user.id);
    res.json({ profile });
  },

  async upsert(req: AuthenticatedRequest, res: Response) {
    const profile = await profileService.upsert(req.user.id, req.body);
    res.json({ profile });
  }
};

