import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { authRateLimit } from "../../middleware/rateLimitMiddleware";
import { validate } from "../../middleware/validateMiddleware";
import { authController } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.schemas";

export const authRoutes = Router();

authRoutes.post("/register", authRateLimit, validate(registerSchema), authController.register);
authRoutes.post("/login", authRateLimit, validate(loginSchema), authController.login);
authRoutes.post("/logout", authMiddleware, authController.logout);
authRoutes.get("/me", authMiddleware, authController.me);

