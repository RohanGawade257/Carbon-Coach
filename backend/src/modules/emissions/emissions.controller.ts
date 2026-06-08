import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { emissionsService } from "./emissions.service";

export const emissionsController = {
  async listCategories(_req: AuthenticatedRequest, res: Response) {
    const categories = await emissionsService.listCategories();
    res.json({ categories });
  },

  async calculate(req: AuthenticatedRequest, res: Response) {
    const result = await emissionsService.calculate(req.body);
    res.json(result);
  }
};

