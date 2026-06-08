import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { dashboardService } from "./dashboard.service";

export const dashboardController = {
  async overview(req: AuthenticatedRequest, res: Response) {
    const dashboard = await dashboardService.overview(req.user.id);
    res.json({ dashboard });
  }
};

