import bcrypt from "bcryptjs";
import { AppError } from "../../shared/errors/AppError";
import { authRepo } from "./auth.repository.js";
import { RegisterUserInput } from "./auth.validation.js";
import { config } from "../../app/config/env.js";
import { UserRole, UserStatus } from "../../../generated/prisma/enums";

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

export const authService = {
  registerUser,
};
