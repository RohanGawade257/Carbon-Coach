import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { validate } from "../../middleware/validateMiddleware";
import { profileController } from "./profile.controller";
import { upsertProfileSchema } from "./profile.schemas";

export const profileRoutes = Router();

profileRoutes.get("/", authMiddleware, profileController.get);
profileRoutes.put("/", authMiddleware, validate(upsertProfileSchema), profileController.upsert);

