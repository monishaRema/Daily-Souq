import { AppError } from "../../shared/errors/AppError.js";
import { userRepo } from "./users.repository.js";

async function getMyProfile(id: string) {
  const user = await userRepo.getMyProfile(id);

  if (!user) {
    throw new AppError(404, "User not found with this id");
  }

  return user;
}

export const userService = {
  getMyProfile,
};
