import { z } from "zod";

export const registerUserSchema = z.object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(100, "Name cannot exceed 100 characters"),

    avatar: z
      .string()
      .trim()
      .pipe(z.url("Avatar must be a valid URL"))
      .optional(),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email("Invalid email address")),

    phone: z
      .string()
      .trim()
      .min(5, "Phone number is too short")
      .max(20, "Phone number is too long")
      .optional(),

    password: z
      .string()
      .trim()
      .min(6, "Password must be at least 6 characters long"),
  })

export type RegisterUserInput = z.infer<typeof registerUserSchema>;

export const loginSchema = z.object({
    email:z.string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Invalid email address")),

    password:z.string()
    .trim()
    .min(6,"Password must be at least 6 characters long")
})

export type LoginUserInput = z.infer<typeof loginSchema>;
