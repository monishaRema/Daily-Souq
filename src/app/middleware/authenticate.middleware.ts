import { NextFunction, Request, Response } from "express";
import { AppError } from "../../shared/errors/AppError";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { JwtPayload } from "../../modules/auth/auth.types";

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return next(new AppError(401, "Unauthorized"));
  }

  try {
    const decoded = jwt.verify(
      accessToken,
      config.JWT_ACCESS_SECRET,
    ) as JwtPayload;
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch {
    return next(new AppError(401, "Access token is invalid or expired"));
  }
};
