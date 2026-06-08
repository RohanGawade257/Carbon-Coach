import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { validate } from "../../middleware/validateMiddleware";
import { challengesController } from "./challenges.controller";
import { challengeParamsSchema, updateUserChallengeSchema } from "./challenges.schemas";

export const challengesRoutes = Router();
export const userChallengesRoutes = Router();

challengesRoutes.get("/", authMiddleware, challengesController.list);
challengesRoutes.post("/:id/join", authMiddleware, validate(challengeParamsSchema), challengesController.join);
userChallengesRoutes.patch("/:id", authMiddleware, validate(updateUserChallengeSchema), challengesController.update);

