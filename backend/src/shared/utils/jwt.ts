import jwt from "jsonwebtoken";
import { env } from "../../config/env";

export type JwtUser = {
  userId: string;
  email: string;
};

export function signToken(payload: JwtUser) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "12h" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as JwtUser;
}

