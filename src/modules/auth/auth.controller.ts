import { Request, Response } from "express";
import { sendResponse } from "../../shared/utils/sendResponse";
import { authService } from "./auth.service";

async function registerUser(req:Request,res:Response) {

    const user = await authService.registerUser(req.body)

    sendResponse({
        res,
        statusCode:201,
        message:"User created successfully",
        data:user
    })
}

async function login(req:Request,res:Response) {
    const user = await authService.loginUser(req.body)

    sendResponse({
        res,
        statusCode:200,
        message: "Login successful",
        data:user
    })
}

export const authController = {
    registerUser,
    login
}