import { Request, Response, NextFunction } from "express";

interface ErrorWithStatus extends Error {
  status?: number;
  success?: boolean;
  errorCode?: number;
}

export const errorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.status || 500;
  const response = {
    success: err.success || false,
    message: err.message || "Internal Server Error",
    errorCode: err.errorCode || 500,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};
