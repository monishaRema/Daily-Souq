import { Request, Response } from "express";
import { sendResponse } from "../../shared/utils/sendResponse";
import { authService } from "./auth.service";
import { config } from "../../app/config/env";

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

export const authController = {
  registerUser,
  login,
};
