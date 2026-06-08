import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { footprintService } from "./footprint.service";

export const footprintController = {
  async calculate(req: AuthenticatedRequest, res: Response) {
    const result = await footprintService.calculate(req.body);
    res.json(result);
  },

  async createEntry(req: AuthenticatedRequest, res: Response) {
    const entry = await footprintService.createEntry(req.user.id, req.body);
    res.status(201).json({ entry });
  },

  async listEntries(req: AuthenticatedRequest, res: Response) {
    const entries = await footprintService.listEntries(req.user.id, req.query);
    res.json({ entries });
  },

  async deleteEntry(req: AuthenticatedRequest, res: Response) {
    const result = await footprintService.deleteEntry(req.user.id, String(req.params.id));
    res.json(result);
  }
};
