import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { usersController } from "./users.controller";

export const usersRoutes = Router();

usersRoutes.get("/me", authMiddleware, usersController.me);
usersRoutes.get("/leaderboard", authMiddleware, usersController.leaderboard);


