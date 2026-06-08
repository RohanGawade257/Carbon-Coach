import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { recommendationsService } from "./recommendations.service";

export const recommendationsController = {
  async list(req: AuthenticatedRequest, res: Response) {
    const recommendations = await recommendationsService.list(req.user.id);
    res.json({ recommendations });
  },

  async generate(req: AuthenticatedRequest, res: Response) {
    const recommendations = await recommendationsService.generate(req.user.id);
    res.status(201).json({ recommendations });
  },

  async update(req: AuthenticatedRequest, res: Response) {
    const recommendation = await recommendationsService.update(req.user.id, String(req.params.id), req.body.status);
    res.json({ recommendation });
  }
};
