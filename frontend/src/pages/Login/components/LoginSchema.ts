import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email").nonempty("Email is required"),
  password: z
    .string()
    .nonempty("Password is required")
    .min(4, "String must contain at least 4 character(s)"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
