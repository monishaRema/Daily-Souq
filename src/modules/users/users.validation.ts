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
