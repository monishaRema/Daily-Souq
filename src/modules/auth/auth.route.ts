import { validateRequest } from './../../app/middleware/validation.middleware.js';
import { Router } from "express";
import { authController } from "./auth.controller.js";
import { registerUserSchema } from './auth.validation.js';

export const authRouter =  Router()
  /**
/auth/login
/auth/refresh-token
/auth/logout
   */
authRouter.post("/register",validateRequest(registerUserSchema,"body"), authController.registerUser)
