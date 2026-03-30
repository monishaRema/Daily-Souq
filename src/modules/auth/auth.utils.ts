import jwt from "jsonwebtoken";
import { config } from "../../app/config/env";
import { JwtPayload } from "./auth.types";




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
