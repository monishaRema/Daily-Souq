import { config } from "../../app/config/env.js";
import { AppError } from "../../shared/errors/AppError.js";
import { userRepo } from "./users.repository.js";
import { UpdateProfileDataType } from "./users.types.js";
import { UpdateMyProfileType, UpdatePasswordType } from "./users.validation.js";
import bcrypt from "bcryptjs";

async function getMyProfile(id: string) {
  const user = await userRepo.getMyProfile(id);

  if (!user) {
    throw new AppError(404, "User not found with this id");
  }

  return user;
}

async function updateMyProfile(id: string, payload: UpdateMyProfileType) {
  const updateData: UpdateProfileDataType = {};

  if (payload.name !== undefined) {
    updateData.name = payload.name;
  }

  if (payload.avatar !== undefined) {
    updateData.avatar = payload.avatar;
  }

  if (payload.phone !== undefined) {
    updateData.phone = payload.phone;
  }

  if (Object.keys(updateData).length === 0) {
    throw new AppError(400, "No valid fields provided for update");
  }

  const updatedProfile = await userRepo.updateMyProfile(id, updateData);

  return updatedProfile;
}

async function updatePassword(id: string, payload: UpdatePasswordType) {
  const user = await userRepo.findUserWithPasswordById(id);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.status !== "ACTIVE") {
    throw new AppError(401, "You are not authorized to update password");
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.oldPassword,
    user.passwordHash,
  );

  if (!isPasswordMatched) {
    throw new AppError(400, "Your old password is incorrect");
  }

  const passwordHash = await bcrypt.hash(
    payload.newPassword,
    config.BCRYPT_SALT_ROUNDS,
  );
  const result = await userRepo.updatePassword(id, passwordHash);

  return result;
}

export const userService = {
  getMyProfile,
  updateMyProfile,
  updatePassword,
};
