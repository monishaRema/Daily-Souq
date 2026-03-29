import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod/v3";
import { AppError } from "../../shared/errors/AppError";

export const validateRequest = (
  schema: ZodSchema,
  reqParts: "body" | "params" | "query",
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsedSchema = schema.safeParse(req[reqParts]);

    if (!parsedSchema.success) {
      const formatError = parsedSchema.error.issues.map((issue) => {
        return {
          field: issue.path.join("."),
          message: issue.message,
        };
      });
      return next(new AppError(400, "Validation failed", formatError));
    }

    req[reqParts] = parsedSchema.data;
    next();
  };
};
