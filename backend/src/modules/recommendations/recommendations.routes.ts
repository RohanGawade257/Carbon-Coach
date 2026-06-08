import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { validate } from "../../middleware/validateMiddleware";
import { recommendationsController } from "./recommendations.controller";
import { updateRecommendationSchema } from "./recommendations.schemas";

export const recommendationsRoutes = Router();

recommendationsRoutes.get("/", authMiddleware, recommendationsController.list);
recommendationsRoutes.post("/generate", authMiddleware, recommendationsController.generate);
recommendationsRoutes.patch("/:id", authMiddleware, validate(updateRecommendationSchema), recommendationsController.update);

