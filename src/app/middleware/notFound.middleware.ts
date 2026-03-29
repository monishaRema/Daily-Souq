import { NextFunction, Request, Response } from "express"
import { AppError } from "../../shared/errors/AppError.js"

export const notFound = (req:Request,res:Response,next:NextFunction) =>{
    return next(new AppError(404,`Not found ${req.method} ${req.originalUrl}`))
}