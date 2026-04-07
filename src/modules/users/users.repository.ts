import { SortOrder } from "./../../../generated/prisma/internal/prismaNamespace";
import { Prisma } from "../../../generated/prisma/client.js";
import { UserUpdateInput } from "../../../generated/prisma/models.js";
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

async function updateMyProfile(id: string, data: Partial<UserUpdateInput>) {
  return prisma.user.update({
    data,
    where: {
      id,
    },
    select: safeUserSelect,
  });
}

async function findUserWithPasswordById(id: string) {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
}

async function updatePassword(id: string, hashedPass: string) {
  return prisma.user.update({
    data: {
      passwordHash: hashedPass,
    },
    where: {
      id,
    },
    select: safeUserSelect,
  });
}

async function getAllUsers(take: number, skip: number) {
  const totalUserCount = await prisma.user.count({});

  const users = await prisma.user.findMany({
    select: safeUserSelect,
    take: take,
    skip: skip,
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    data: users,
    meta: {
      page: (skip / take) + 1,
      limit: take,
      totalItems: totalUserCount,
      totalPages: Math.ceil(totalUserCount / take),
    },
  };
}

export const userRepo = {
  getMyProfile,
  updateMyProfile,
  updatePassword,
  findUserWithPasswordById,
  getAllUsers,
};
