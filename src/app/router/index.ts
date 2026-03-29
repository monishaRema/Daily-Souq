import { Request, Response, Router } from "express";
import { sendResponse } from "../../shared/utils/sendResponse";
import { authRouter } from "../../modules/auth/auth.route";

export const router = Router()

router.get("/health",(_req:Request,res:Response)=>{
    sendResponse({
        res,
        statusCode:200,
        message:"Application is running successfully"
    })
})


router.use("/auth",authRouter)