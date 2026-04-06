import { Router } from "express";
import { userController } from "./users.controller.js";

export const userRouter = Router()


userRouter.get(
  "/profile",
  userController.getMyProfile
);

// userRouter.patch(
//   "/profile",
//   validateRequest(updateMyProfileSchema, "body"),
//   userController.updateMyProfile
// );

// userRouter.get(
//   "/",
//   authorize("ADMIN"),
//   validateRequest(getUsersQuerySchema, "query"),
//   userController.getAllUsers
// );

// userRouter.get(
//   "/:id",
//   authorize("ADMIN"),
//   userController.getSingleUser
// );

// userRouter.patch(
//   "/:id/status",
//   authorize("ADMIN"),
//   validateRequest(updateUserStatusSchema, "body"),
//   userController.updateUserStatus
// );