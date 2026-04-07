import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../../shared/errors/AppError";

export const validateRequest = (
  schema: z.ZodTypeAny,
  reqParts: "body" | "params" | "query",
) => {
  return (req: Request, res: Response, next: NextFunction) => {
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


     if (reqParts === "query") {
      res.locals.validated ??= {};
      res.locals.validated.query = parsedSchema.data;
    } else {
      req[reqParts] = parsedSchema.data;
    }

    next();
  };
};
