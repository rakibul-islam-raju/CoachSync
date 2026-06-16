import * as z from "zod";

const teacherUserSchema = z.object({
  first_name: z.string({ error: "First name is required" }),
  last_name: z.string({ error: "Last name is required" }),
  email: z.string({ error: "Email is required" }).email("Invalid email"),
  phone: z
    .string({ error: "Phone is required" })
    .regex(new RegExp("^(01){1}[3-9]{1}\\d{8}$"), "Invalid phone number"),
});

export const teacherCreateSchema = z.object({
  user: teacherUserSchema,
  is_active: z.boolean(),
});

export type ITeacherCreateFormValues = z.infer<typeof teacherCreateSchema>;

export const teacherUpdateSchema = teacherCreateSchema
  .partial()
  .extend({ user: teacherUserSchema.partial().optional() });
