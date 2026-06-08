import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { carbonTwinService } from "./carbonTwin.service";

export const carbonTwinController = {
  async build(req: AuthenticatedRequest, res: Response) {
    const result = await carbonTwinService.build(req.user.id);
    res.json({ twin: result.twin, usedLocalInsights: result.usedLocalInsights });
  },

  async get(req: AuthenticatedRequest, res: Response) {
    const result = await carbonTwinService.get(req.user.id);
    res.json(result);
  },

  async simulate(req: AuthenticatedRequest, res: Response) {
    const result = await carbonTwinService.simulate(req.user.id, req.body);
    res.status(201).json({ simulation: result.simulation, usedLocalInsights: result.usedLocalInsights });
  },

  async generateActionPlan(req: AuthenticatedRequest, res: Response) {
    const result = await carbonTwinService.generateActionPlan(req.user.id);
    res.status(201).json({ actionPlan: result.actionPlan, usedLocalInsights: result.usedLocalInsights });
  },

  async updateActionItem(req: AuthenticatedRequest, res: Response) {
    const item = await carbonTwinService.updateActionItem(req.user.id, String(req.params.id), req.body.status);
    res.json({ item });
  }
};
