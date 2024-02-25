import * as z from "zod";

export const studentCreateSchema = z.object({
  user: z.object({
    first_name: z.string({ required_error: "First name is required" }),
    last_name: z.string({ required_error: "Last name is required" }),
    email: z.string({ required_error: "Email is required" }).email(),
    phone: z
      .string({ required_error: "Phone is required" })
      .regex(new RegExp("^(01){1}[3-9]{1}\\d{8}$"), "Invalid phone number"),
  }),
  emergency_contact_no: z
    .string()
    .regex(new RegExp("^(01){1}[3-9]{1}\\d{8}$"), "Invalid phone number"),
  date_of_birth: z.string(),
  blood_group: z.string().optional().nullable(),
  address: z.string({ required_error: "Address is required" }),
  description: z.string().optional().nullable(),
  is_active: z.boolean(),
});

export const updateSchema = studentCreateSchema.deepPartial();

export type IStudentCreateFormValues = z.infer<typeof studentCreateSchema>;

export const studentEnrollSchema = z.object({
  student: z.number(),
  batch: z.number({ required_error: "Batch is required" }),
  total_amount: z.number({ required_error: "Total amount is required" }),
  discount_amount: z.number().optional().nullable(),
  reference_by: z.number().optional().nullable(),
});

export type IStudentEnrollFormValues = z.infer<typeof studentEnrollSchema>;

export const studentEnrollUpdateSchema = studentEnrollSchema.partial();

export const TransactionSchema = z.object({
  enroll: z.number(),
  amount: z.number({ required_error: "Amount is required" }).min(10),
  remark: z.string().optional().nullable(),
});

export type ITransactionFormValues = z.infer<typeof TransactionSchema>;
