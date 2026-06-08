import cors from "cors";
import express from "express";
import helmet from "helmet";
import { Express } from "express";
import { env } from "../config/env";

export function applySecurityMiddleware(app: Express) {
  app.use(helmet());
  app.use(
    cors({
      origin: env.FRONTEND_ORIGIN.split(",").map((origin) => origin.trim()),
      credentials: false
    })
  );
  app.use(express.json({ limit: "1mb" }));
}

