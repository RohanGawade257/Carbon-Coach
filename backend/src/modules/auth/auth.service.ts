import { prisma } from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";
import { hashPassword, verifyPassword } from "../../shared/utils/password";
import { signToken } from "../../shared/utils/jwt";

function serializeUser(user: {
  id: string;
  email: string;
  displayName: string;
  currentStreak: number;
  lastLogDate: string | null;
  carbonScore: number;
  points: number;
  profile?: unknown | null;
}) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    hasProfile: Boolean(user.profile),
    isDemo: user.email === "demo@carboncoach.local",
    currentStreak: user.currentStreak,
    lastLogDate: user.lastLogDate,
    carbonScore: user.carbonScore,
    points: user.points
  };
}




export const authService = {
  async register(input: { email: string; password: string; displayName: string }) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new AppError("Email is already registered", 409, "EMAIL_EXISTS");
    }

    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        displayName: input.displayName
      },
      include: { profile: true }
    });

    const token = signToken({ userId: user.id, email: user.email });
    return { user: serializeUser(user), token };
  },

  async login(input: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: { profile: true }
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    }

    const valid = await verifyPassword(user.passwordHash, input.password);
    if (!valid) {
      throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    }

    const token = signToken({ userId: user.id, email: user.email });
    return { user: serializeUser(user), token };
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    return serializeUser(user);
  }
};

