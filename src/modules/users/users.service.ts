import { AppError } from "../../shared/errors/AppError.js";
import { userRepo } from "./users.repository.js";
import { UpdateProfileDataType } from "./users.types.js";
import { UpdateMyProfileType } from "./users.validation.js";

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

export const userService = {
  getMyProfile,
  updateMyProfile,
};
