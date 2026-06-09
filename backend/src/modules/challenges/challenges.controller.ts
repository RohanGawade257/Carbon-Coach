import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { challengesService } from "./challenges.service";

export const challengesController = {
  async list(req: AuthenticatedRequest, res: Response) {
    const challenges = await challengesService.list(req.user.id);
    res.json({ challenges });
  },

  async join(req: AuthenticatedRequest, res: Response) {
    const userChallenge = await challengesService.join(req.user.id, String(req.params.id));
    res.status(201).json({ userChallenge });
  },

  async update(req: AuthenticatedRequest, res: Response) {
    const userChallenge = await challengesService.update(req.user.id, String(req.params.id), req.body);
    res.json({ userChallenge });
  },

  async completeChallenge(req: AuthenticatedRequest, res: Response) {
    const { challengeId, userChallengeId } = req.body;
    const userChallenge = await challengesService.completeChallenge(req.user.id, challengeId, userChallengeId);
    res.json({ success: true, userChallenge });
  }
};

