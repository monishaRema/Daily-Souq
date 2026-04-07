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

async function findUserWithPasswordById(id:string){
  return prisma.user.findUnique({
    where:{
      id
    }
  })
}


async function updatePassword(id:string, hashedPass:string) {
  return prisma.user.update({
    data:{
      passwordHash:hashedPass
    },
    where:{
      id
    },
    select: safeUserSelect,

  })
  
}

export const userRepo = {
  getMyProfile,
  updateMyProfile,
  updatePassword,
  findUserWithPasswordById
};
