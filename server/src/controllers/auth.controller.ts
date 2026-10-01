import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../drizzle/db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";
import type { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import ms from "ms";
import { CatchAsync } from "../utils/CatchAync";
import AppError from "../utils/AppError";
import {
  clearAuthCookies,
  generateTokens,
  getCookieOptions,
  setAuthCookies,
} from "../helper/auth.helper";
import { getRequiredEnvVar } from "../helper/shared.helper";
import { authErrorCodes } from "../utils/errorCodes";

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const ACCESS_TOKEN_LIFE = process.env.ACCESS_TOKEN_LIFE || "15m";
const REFRESH_TOKEN_LIFE = process.env.REFRESH_TOKEN_LIFE || "7d";

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error("JWT secrets must be defined in .env file");
}

export const register = CatchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError(authErrorCodes.INVALID_CREDENTIALS, 400);
  }

  const salt = 10;
  const hashedPW = await bcrypt.hash(password, salt);

  try {
    await db.insert(users).values({
      email: email.toLowerCase().trim(),
      password: hashedPW,
    });

    res.status(201).json({
      success: true,
    });
  } catch (error: any) {
    if (error.errno === 1062) {
      throw new AppError(authErrorCodes.USER_ALREADY_EXISTS, 400);
    }
    throw new AppError(authErrorCodes.FAILED_TO_REGISTER_USER, 400);
  }
});

export const loginUser = CatchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError(authErrorCodes.INVALID_CREDENTIALS, 400);
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1);

  if (!user[0]) {
    throw new AppError(authErrorCodes.USER_NOT_FOUND, 401);
  }

  const userData = user[0];

  const comparedPassword = await bcrypt.compare(password, userData.password);

  if (!comparedPassword) {
    throw new AppError(authErrorCodes.WRONG_PASSWORD, 401);
  }

  const tokenPayload = {
    id: userData.id,
    email: userData.email,
  };

  const { accessToken, refreshToken } = generateTokens(tokenPayload);

  setAuthCookies(res, accessToken, refreshToken);

  res.status(200).json({
    success: true,
    message: "Logged in successfully!",
    user: {
      id: userData.id,
      email: userData.email,
    },
  });
});

export const refreshToken = CatchAsync(async (req: Request, res: Response) => {
  const refreshTokenCookie = req.cookies.r;

  if (!refreshTokenCookie) {
    throw new AppError(authErrorCodes.NO_REFRESH_TOKEN, 401);
  }

  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(
      refreshTokenCookie,
      getRequiredEnvVar("REFRESH_TOKEN_SECRET")
    ) as JwtPayload;

    if (!decoded?.id || !decoded?.email) {
      throw new AppError(authErrorCodes.INVALID_REFRESH_TOKEN, 401);
    }
  } catch (error) {
    throw new AppError(authErrorCodes.SESSION_EXPIRED, 401);
  }

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, decoded.id))
    .limit(1);

  if (!user) {
    throw new AppError(authErrorCodes.USER_NOT_FOUND, 403);
  }

  const tokenPayload = {
    id: user.id,
    email: user.email,
  };

  const { accessToken, refreshToken } = generateTokens(tokenPayload);

  setAuthCookies(res, accessToken, refreshToken);

  res.status(200).json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
    },
  });
});

export const logoutUser = CatchAsync(async (req: Request, res: Response) => {
  clearAuthCookies(res);
  res.status(200).json({ success: true, message: "Logged out successfully!" });
});
