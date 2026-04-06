import { Request, Response, Router } from "express";
import { sendResponse } from "../../shared/utils/sendResponse.js";
import { authRouter } from "../../modules/auth/auth.route.js";
import { userRouter } from "../../modules/users/users.route.js";
import { authenticate } from "../middleware/authenticate.middleware.js";

export const router = Router()

router.get("/health",(_req:Request,res:Response)=>{
    sendResponse({
        res,
        statusCode:200,
        message:"Application is running successfully"
    })
})


router.use("/auth",authRouter)
router.use("/users",authenticate,userRouter)
