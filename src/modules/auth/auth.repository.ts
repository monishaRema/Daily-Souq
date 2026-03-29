
import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../shared/lib/prisma.js";

const safeUserSelect  = {
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

async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email: email,
    },
    select:safeUserSelect
  });
}
async function findUserByEmailAuth(email: string) {
  return prisma.user.findUnique({
    where: {
      email: email,
    },
  });
}

async function createUser(data: Prisma.UserCreateInput) {
  return prisma.user.create({
    data: data,
    select: safeUserSelect ,
  });
}

export const authRepo = {
  findUserByEmail,
  createUser,
  findUserByEmailAuth
};
