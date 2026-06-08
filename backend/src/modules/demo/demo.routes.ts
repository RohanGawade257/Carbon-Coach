import { Router } from "express";
import { authRateLimit } from "../../middleware/rateLimitMiddleware";
import { demoController } from "./demo.controller";

export const demoRoutes = Router();

demoRoutes.post("/login", authRateLimit, demoController.login);

