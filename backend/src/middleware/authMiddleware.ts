import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { AppError } from "../shared/errors/AppError";
import { verifyToken } from "../shared/utils/jwt";

export type AuthenticatedUser = {
  id: string;
  email: string;
  displayName: string;
  isDemo: boolean;
};

declare global {
  namespace Express {
    interface Request {
      user: AuthenticatedUser;
    }
  }
}

export type AuthenticatedRequest = Request;

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }

  const token = header.slice("Bearer ".length);
  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    throw new AppError("Invalid or expired session", 401, "INVALID_SESSION");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, displayName: true }
  });

  if (!user) {
    throw new AppError("Invalid session", 401, "INVALID_SESSION");
  }

  req.user = {
    ...user,
    isDemo: user.email === "demo@carboncoach.local"
  };
  next();
}
