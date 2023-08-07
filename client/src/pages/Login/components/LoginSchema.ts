import * as z from "zod";

export const loginSchema = z.object({
	email: z.string().email().nonempty("Email is required"),
	password: z.string().nonempty("Password is required").min(4),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
