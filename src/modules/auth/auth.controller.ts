import { Request, Response } from "express";
import { sendResponse } from "../../shared/utils/sendResponse.js";
import { authService } from "./auth.service.js";
import { config } from "../../app/config/env.js";
import { AppError } from "../../shared/errors/AppError.js";

async function registerUser(req: Request, res: Response) {
  const user = await authService.registerUser(req.body);

  sendResponse({
    res,
    statusCode: 201,
    message: "User created successfully",
    data: user,
  });
}

async function login(req: Request, res: Response) {
  const authResult = await authService.login(req.body);

  res.cookie("refreshToken", authResult.refreshToken, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  sendResponse({
    res,
    statusCode: 200,
    message: "Login successful",
    data: {
      user: authResult.user,
      token: authResult.accessToken,
    },
  });
}

async function getMe(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "Unauthorized");
  }

  const user = await authService.getMe(req.user.userId);
  sendResponse({
    res,
    statusCode: 200,
    message: "Fetched user data successfully",
    data: "",
  });
}

export const authController = {
  registerUser,
  login,
  getMe,
};
