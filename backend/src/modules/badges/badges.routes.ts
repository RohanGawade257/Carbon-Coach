import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { badgesController } from "./badges.controller";

export const badgesRoutes = Router();

badgesRoutes.get("/me", authMiddleware, badgesController.getMine);

