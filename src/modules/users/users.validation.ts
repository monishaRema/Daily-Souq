import z from "zod";

export const updateMyProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be more than 2 char")
      .max(100, "Name cannot exceed 100 characters")
      .optional(),
    avatar: z
      .string()
      .trim()
      .pipe(z.url("Avatar must be a valid URL"))
      .optional(),
    phone: z
      .string()
      .trim()
      .min(8, "Phone can not be less than 8 digit")
      .max(12, "Phone can not exceed 12 digit")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required for update",
  });
export type UpdateMyProfileType = z.infer<typeof updateMyProfileSchema>;

export const updatePasswordSchema = z.object({
  oldPassword: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters long"),
  newPassword: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters long"),
});

export type UpdatePasswordType = z.infer<typeof updatePasswordSchema>;

export const userQueryValidate = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).optional(),
});

export type UserQueryType = z.infer<typeof userQueryValidate>;

export const validateIdSchema = z.object({
  id: z.string().pipe(z.uuid("Invalid id format")),
});

export type IdParamsType = z.infer<typeof validateIdSchema>;

export const updateUserStatusSchema = z.object({
  status: z
    .string()
    .trim()
    .min(1, "Status is required")
    .transform((val) => val.toUpperCase())
    .pipe(
      z.enum(["ACTIVE", "SUSPENDED", "ARCHIVED"], {
        error: "Invalid user status",
      }),
    ),
});
export type UpdateUserStatusType = z.infer<typeof updateUserStatusSchema>;
