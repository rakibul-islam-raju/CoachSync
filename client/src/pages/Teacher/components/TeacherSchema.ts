import * as z from "zod";

export const TeacherCreateSchema = z.object({
  user: z.object({
    first_name: z.string({ required_error: "First name is required" }),
    last_name: z.string({ required_error: "Last name is required" }),
    email: z.string({ required_error: "Email is required" }).email(),
    phone: z
      .string({ required_error: "Phone is required" })
      .regex(new RegExp("^(01){1}[3-9]{1}\\d{8}$"), "Invalid phone number"),
  }),
  is_active: z.boolean(),
});

export type ITeacherCreateFormValues = z.infer<typeof TeacherCreateSchema>;
