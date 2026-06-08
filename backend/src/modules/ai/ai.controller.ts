import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { aiService } from "./ai.service";

export const aiController = {
  async createConversation(req: AuthenticatedRequest, res: Response) {
    const conversation = await aiService.createConversation(req.user.id, req.body?.title);
    res.status(201).json({ conversation });
  },

  async listConversations(req: AuthenticatedRequest, res: Response) {
    const conversations = await aiService.listConversations(req.user.id);
    res.json({ conversations });
  },

  async getConversation(req: AuthenticatedRequest, res: Response) {
    const conversation = await aiService.getConversation(req.user.id, String(req.params.id));
    res.json({ conversation });
  },

  async sendMessage(req: AuthenticatedRequest, res: Response) {
    const message = await aiService.sendMessage(req.user.id, String(req.params.id), req.body.content);
    res.status(201).json({ message });
  }
};
