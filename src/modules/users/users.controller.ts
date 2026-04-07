import { Request, Response } from "express";
import { sendResponse } from "../../shared/utils/sendResponse.js";
import { AppError } from "../../shared/errors/AppError.js";
import { userService } from "./users.service.js";
import { UserQueryType } from "./users.validation.js";

async function getMyProfile(req:Request,res:Response){
     if (!req.user) {
        throw new AppError(401, "Unauthorized");
      }
    
      const user = await userService.getMyProfile(req.user.userId);
      sendResponse({
        res,
        statusCode: 200,
        message: "Profile retrieved successfully",
        data: user,
      });
}


async function updateMyProfile (req:Request,res:Response){

  if(!req.user){
    throw new AppError(401,"Unauthorized")
  }
  const updatedProfile = await userService.updateMyProfile(
    req.user.userId,
    req.body
  );

  sendResponse({
    res,
    statusCode:200,
    message: "User profile updated successfully",
    data:updatedProfile
  })

}

async function updatePassword (req:Request,res:Response){

if(!req.user){
  throw new AppError(401,"Unauthorized")
}

  await userService.updatePassword(req.user.userId,req.body)

  sendResponse({
    res,
    statusCode:200,
    message:"Password updated successfully"
  })
}

async function getAllUsers(req: Request, res: Response) {
  const query = res.locals.validated.query

  const result = await userService.getAllUsers(query as UserQueryType);

  sendResponse({
    res,
    statusCode: 200,
    message: "Fetched all users successfully",
    data: result.data,
    meta: result.meta
  });
}

export const userController = {
    getMyProfile,
    updateMyProfile,
    updatePassword,
    getAllUsers
}