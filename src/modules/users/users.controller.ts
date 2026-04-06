import { Request, Response } from "express";
import { sendResponse } from "../../shared/utils/sendResponse.js";
import { AppError } from "../../shared/errors/AppError.js";
import { userService } from "./users.service.js";

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


export const userController = {
    getMyProfile
}