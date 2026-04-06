import { NextFunction, Request, Response } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { AppError } from "../../shared/errors/AppError.js";

export const authorize = (...role: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, "Unauthorized"));
    }

    if (!role.includes(req.user.role)) {
      return next(new AppError(403, "Forbidden: You are not authorized"));
    }

    next();
  };
};
