import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../shared/lib/prisma.js";

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  avatar: true,
  phone: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

async function getMyProfile(id: string) {
  return prisma.user.findUnique({
    select: safeUserSelect,
    where: {
      id,
      status: "ACTIVE",
    },
  });
}

export const userRepo = {
  getMyProfile,
};
