import { CatchAsync } from "../utils/CatchAync";
import jwt, { JwtPayload } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

interface CustomRequest extends Request {
  userId?: number;
  email?: string;
}

export const verifyToken = CatchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const cookie = req.cookies;
    const access_token = cookie.a;
    if (!access_token) {
      res
        .status(404)
        .json({ message: "No access token found", errorCode: 10001 });
    }

    let decode: JwtPayload = {} as JwtPayload;
    try {
      decode = jwt.verify(
        access_token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as JwtPayload;
    } catch (error) {
      res.status(401).json({ message: "Session expired", errorCode: 10001 });
    }

    if (!decode) {
      res.status(401).json({ message: "Session expired", errorCode: 10001 });
    }

    req.userId = decode.id;
    req.email = decode.email;
    next();
  }
);
