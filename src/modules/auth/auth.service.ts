
import bcrypt from "bcryptjs";
import { AppError } from "../../shared/errors/AppError.js";
import { authRepo } from "./auth.repository.js";
import { LoginUserInput, RegisterUserInput } from "./auth.validation.js";
import { config } from "../../app/config/env.js";
import jwt from "jsonwebtoken";
import { UserRole, UserStatus } from "../../../generated/prisma/enums.js";
import { JwtPayload } from "./auth.types.js";
import { generateAccessToken, generateRefreshToken } from "./auth.utils.js";

async function registerUser(payload: RegisterUserInput) {
  const existingUser = await authRepo.findUserByEmail(payload.email);

  if (existingUser) {
    throw new AppError(409, "User already exists with this email");
  }

  const passwordHash = await bcrypt.hash(
    payload.password,
    config.BCRYPT_SALT_ROUNDS,
  );

  const user = await authRepo.createUser({
    name: payload.name,
    email: payload.email.toLowerCase(),
    passwordHash,
    avatar: payload.avatar ?? null,
    phone: payload.phone ?? null,
    role: UserRole.CUSTOMER,
    status: UserStatus.ACTIVE,
  });

  return user;
}

async function login(payload: LoginUserInput) {
  const user = await authRepo.findUserByEmailAuth(payload.email);

  if (!user) {
    throw new AppError(401, "No user found with this email");
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new AppError(403, "This account is not allowed to log in");
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.passwordHash,
  );

  if (!isPasswordMatched) {
    throw new AppError(401, "Invalid password");
  }

  const tokenPayload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    user: {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    accessToken,
    refreshToken,
  };
}

async function getMe(id: string) {
  const user = await authRepo.findSafeUserById(id)

  if(!user){
    throw new AppError(404,"User not found with this id")
  }

  return user

}

async function refreshToken(token: string) {
  try {
    const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET) as JwtPayload;

    const user = await authRepo.findSafeUserById(decoded.userId);

    if (!user) {
      throw new AppError(404, "User not found");
    }

    if (user.status !== "ACTIVE") {
      throw new AppError(403, "This account is not allowed");
    }

    const accessToken = generateAccessToken({
       userId: user.id, 
       email:user.email,
       role:user.role
       });


       return {accessToken}
  } catch(error) {
    console.error(error)
    throw new AppError(401, "Refresh token is invalid or expired");
  }
}


export const authService = {
  registerUser,
  login,
  getMe,
  refreshToken,
};
