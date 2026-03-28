import { Router } from "express";

export const router = Router()

router.get("/health",(req,res)=>{
    res.status(200).json({
        message:"Health is okay"
    })
})