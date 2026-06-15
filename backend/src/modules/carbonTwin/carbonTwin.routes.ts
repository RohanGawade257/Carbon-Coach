import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { validate } from "../../middleware/validateMiddleware";
import { carbonTwinController } from "./carbonTwin.controller";
import { simulateCarbonTwinSchema, updateActionPlanItemSchema } from "./carbonTwin.schemas";
import { aiRateLimit } from "../../middleware/rateLimitMiddleware";

export const carbonTwinRoutes = Router();
export const actionPlanRoutes = Router();

carbonTwinRoutes.post("/build", authMiddleware, aiRateLimit, carbonTwinController.build);
carbonTwinRoutes.get("/", authMiddleware, carbonTwinController.get);
carbonTwinRoutes.post("/simulate", authMiddleware, aiRateLimit, validate(simulateCarbonTwinSchema), carbonTwinController.simulate);
carbonTwinRoutes.post("/action-plan", authMiddleware, aiRateLimit, carbonTwinController.generateActionPlan);
actionPlanRoutes.patch("/items/:id", authMiddleware, validate(updateActionPlanItemSchema), carbonTwinController.updateActionItem);
