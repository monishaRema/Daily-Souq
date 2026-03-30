import { validateRequest } from "./../../app/middleware/validation.middleware.js";
import { Router } from "express";
import { authController } from "./auth.controller.js";
import {  loginSchema, registerUserSchema } from "./auth.validation.js";

export const authRouter = Router();
/**
/auth/login
/auth/refresh-token
/auth/logout
   */

authRouter.post(
  "/register",
  validateRequest(registerUserSchema, "body"),
  authController.registerUser,
);

authRouter.post("/login",validateRequest(loginSchema,"body"),authController.login)

authRouter.get("/me", authController.getMe);


