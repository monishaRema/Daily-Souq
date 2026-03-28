import { Request, Response, Router } from "express";
import { sendResponse } from "../../shared/utils/sendResponse";

export const router = Router()

router.get("/health",(_req:Request,res:Response)=>{
    sendResponse({
        res,
        statusCode:200,
        message:"Application is running successfully"
    })
})