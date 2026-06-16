import * as z from "zod";

export const EmployeeCreateSchema = z.object({
  first_name: z.string({ error: "First name is required" }),
  last_name: z.string({ error: "Last name is required" }),
  email: z.string({ error: "Email is required" }).email("Invalid email"),
  role: z.string({ error: "Role is required" }),
  phone: z
    .string({ error: "Phone is required" })
    .regex(new RegExp("^(01){1}[3-9]{1}\\d{8}$"), "Invalid phone number"),
  is_active: z.boolean(),
});

export const EmployeeUpdateSchema = EmployeeCreateSchema.partial();

export type IEmployeeCreateFormValues = z.infer<typeof EmployeeCreateSchema>;
