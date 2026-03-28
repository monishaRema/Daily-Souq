import { Response } from "express";

type Meta = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

type ResponseType<T> = {
  res: Response;
  statusCode: number;
  message: string;
  data?: T;
  meta?: Meta;
};

export const sendResponse = <T>({
  res,
  statusCode,
  message,
  data,
  meta,
}: ResponseType<T>) => {
  const response = {
    success: true,
    message: message,
    ...(data !== undefined ? { data } : {}),
    ...(meta !== undefined ? { meta } : {}),
  };

  return res.status(statusCode).json(response);
};
