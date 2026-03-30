import { UserRole } from "../../../generated/prisma/enums";
export type JwtPayload = {
  userId: string;
  email: string;
  role: UserRole;
};