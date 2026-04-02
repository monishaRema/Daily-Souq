import { Request, Response } from "express";
import { sendResponse } from "../../shared/utils/sendResponse.js";
import { authService } from "./auth.service.js";
import { AppError } from "../../shared/errors/AppError.js";
import { clearCookie, setCookie } from "./auth.utils.js";

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

  setCookie(
    res,
    "refreshToken",
    authResult.refreshToken,
    7 * 24 * 60 * 60 * 1000,
  );
  setCookie(res, "accessToken", authResult.accessToken, 60 * 60 * 1000);

  sendResponse({
    res,
    statusCode: 200,
    message: "Login successful",
    data: {
      user: authResult.user,
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
    data: user,
  });
}

async function refreshToken(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError(401, "Refresh token required");
  }

  const tokenResult = await authService.refreshToken(refreshToken);

  setCookie(res, "accessToken", tokenResult.accessToken, 60 * 60 * 1000);

  sendResponse({
    res,
    statusCode: 200,
    message: "Access token refreshed successfully",
  });
}

async function logout(req: Request, res: Response) {
  clearCookie(res, "accessToken");
  clearCookie(res, "refreshToken");

  sendResponse({
    res,
    statusCode: 200,
    message: "Logout successful",
  });
}

export const authController = {
  registerUser,
  login,
  getMe,
  refreshToken,
  logout,
};
