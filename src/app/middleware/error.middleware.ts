import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { AppError } from "../../shared/error/AppError.js";


type ResponseType<T = unknown> = {
  success: boolean;
  message: string;
  errDetails?: T;
};

export const errorHandler: ErrorRequestHandler = (
  err,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let statusCode = 500;
  let message = "Internal server error";

  let errDetails: unknown;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errDetails = err.details;
  } else if (err instanceof Error) {
    message = err.message;
  }

  const response: ResponseType = {
    success: false,
    message,
  };

  if (errDetails !== undefined) {
    response.errDetails = errDetails;
  }

  return res.status(statusCode).json(response);
};
