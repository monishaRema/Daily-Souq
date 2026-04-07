import { Router } from "express";
import { userController } from "./users.controller.js";
import { validateRequest } from "../../app/middleware/validation.middleware.js";
import {
  updateMyProfileSchema,
  updatePasswordSchema,
  updateUserStatusSchema,
  userQueryValidate,
  validateIdSchema,
} from "./users.validation.js";
import { authorize } from "../../app/middleware/authorize.middleware.js";

export const userRouter = Router();

userRouter.get("/profile", userController.getMyProfile);

userRouter.patch(
  "/profile",
  validateRequest(updateMyProfileSchema, "body"),
  userController.updateMyProfile,
);

userRouter.patch(
  "/password",
  validateRequest(updatePasswordSchema, "body"),
  userController.updatePassword,
);

userRouter.get(
  "/",
  authorize("ADMIN"),
  validateRequest(userQueryValidate, "query"),
  userController.getAllUsers,
);

userRouter.get(
  "/:id",
  authorize("ADMIN"),
  validateRequest(validateIdSchema, "params"),
  userController.getSingleUser,
);


/**
 * admin only route 
 * get : id, status from client
 * validate id
 * validate status within   ACTIVE | SUSPENDED | ARCHIVED
 * send updated user to client
 */

userRouter.patch(
  "/:id/status",
  authorize("ADMIN"),
  validateRequest(validateIdSchema, "params"),
  validateRequest(updateUserStatusSchema, "body"),
  userController.updateUserStatus
);
