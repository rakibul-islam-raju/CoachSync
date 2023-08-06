import * as z from "zod";

export const loginSchema = z.object({
	email: z.string({ required_error: "Email is required" }).email(),
	password: z.string({ required_error: "Password is required" }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
