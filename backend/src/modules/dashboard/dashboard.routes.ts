import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { dashboardController } from "./dashboard.controller";

export const dashboardRoutes = Router();

dashboardRoutes.get("/overview", authMiddleware, dashboardController.overview);

