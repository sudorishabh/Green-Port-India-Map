import { Response } from "express";
import { getRequiredEnvVar } from "./shared.helper";
import jwt from "jsonwebtoken";
export interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}
export interface TokenPayload {
  id: number;
  email: string;
}
export const getCookieOptions = (isRefreshToken = false): ITokenOptions => {
  const isProd = process?.env?.NODE_ENV === "production";

  return {
    expires: new Date(
      Date.now() + (isRefreshToken ? 15 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000)
    ),
    maxAge: isRefreshToken ? 15 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000,
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
  };
};

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
) => {
  res.cookie("a", accessToken, getCookieOptions(false));
  res.cookie("r", refreshToken, getCookieOptions(true));
};

export const generateTokens = (payload: TokenPayload) => {
  const accessToken = jwt.sign(
    payload,
    getRequiredEnvVar("ACCESS_TOKEN_SECRET"),
    {
      expiresIn: "1h",
    }
  );

  const refreshToken = jwt.sign(
    payload,
    getRequiredEnvVar("REFRESH_TOKEN_SECRET"),
    {
      expiresIn: "15d",
    }
  );

  return { accessToken, refreshToken };
};

export const clearAuthCookies = (res: Response) => {
  const isProd = process?.env?.NODE_ENV === "production";

  res.cookie("a", "", {
    maxAge: 1,
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    path: "/",
  });

  res.cookie("r", "", {
    maxAge: 1,
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    path: "/",
  });
};
