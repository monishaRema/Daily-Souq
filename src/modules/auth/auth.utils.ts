import jwt from "jsonwebtoken";
import { config } from "../../app/config/env.js";
import { JwtPayload } from "./auth.types.js";
import { Response } from "express";


export const generateAccessToken = (payload: JwtPayload) => {
  const options: jwt.SignOptions = {
    expiresIn:
      (config.JWT_EXPIRES_IN_ACCESS_TOKEN as jwt.SignOptions["expiresIn"]) ||
      "1h",
  };

  return jwt.sign(payload, config.JWT_ACCESS_SECRET, options);
};

export const generateRefreshToken = (payload: JwtPayload) => {
  const options: jwt.SignOptions = {
    expiresIn:
      (config.JWT_EXPIRES_IN_REFRESH_TOKEN as jwt.SignOptions["expiresIn"]) ||
      "7d",
  };

  return jwt.sign(payload, config.JWT_REFRESH_SECRET, options);
};


export const setCookie = (res:Response,cookieName:string,token:string,age:number) =>{

   res.cookie(cookieName, token, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "strict",
    maxAge: age,
  });
}
