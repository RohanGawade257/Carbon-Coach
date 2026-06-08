import { prisma } from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";

export const usersService = {
  async getById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        createdAt: true,
        profile: true
      }
    });

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    return {
      ...user,
      hasProfile: Boolean(user.profile),
      isDemo: user.email === "demo@carboncoach.local"
    };
  }
};

