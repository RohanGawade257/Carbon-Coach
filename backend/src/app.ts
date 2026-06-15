import "express-async-errors";
import express from "express";
import { applySecurityMiddleware } from "./middleware/securityMiddleware";
import { errorMiddleware } from "./middleware/errorMiddleware";
import { authRoutes } from "./modules/auth/auth.routes";
import { usersRoutes } from "./modules/users/users.routes";
import { profileRoutes } from "./modules/profile/profile.routes";
import { emissionsRoutes } from "./modules/emissions/emissions.routes";
import { footprintRoutes } from "./modules/footprint/footprint.routes";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes";
import { actionPlanRoutes, carbonTwinRoutes } from "./modules/carbonTwin/carbonTwin.routes";
import { aiRoutes } from "./modules/ai/ai.routes";
import { recommendationsRoutes } from "./modules/recommendations/recommendations.routes";
import { challengesRoutes, userChallengesRoutes } from "./modules/challenges/challenges.routes";
import { badgesRoutes } from "./modules/badges/badges.routes";
import { demoRoutes } from "./modules/demo/demo.routes";
import { ocrRoutes } from "./modules/ocr/ocr.routes";

export const app = express();

applySecurityMiddleware(app);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "carbon-coach-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/emissions", emissionsRoutes);
app.use("/api/footprint", footprintRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/carbon-twin", carbonTwinRoutes);
app.use("/api/action-plan", actionPlanRoutes);

app.use("/api/ai", aiRoutes);
app.use("/api/recommendations", recommendationsRoutes);
app.use("/api/challenges", challengesRoutes);
app.use("/api/user-challenges", userChallengesRoutes);
app.use("/api/badges", badgesRoutes);
app.use("/api/demo", demoRoutes);
app.use("/api/ocr", ocrRoutes);

app.use(errorMiddleware);
