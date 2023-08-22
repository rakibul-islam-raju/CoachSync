import * as z from "zod";

export const subjectCreateSchema = z.object({
  name: z.string({ required_error: "Name is required" }),
  code: z.string({ required_error: "Code is required" }),
  is_active: z.boolean(),
});

export type ISubjectCreateFormValues = z.infer<typeof subjectCreateSchema>;

export const subjectUpdateSchema = z.object({
  name: z.string().optional(),
  code: z.string().optional(),
  is_active: z.boolean(),
});

export type ISubjectUpdateFormValues = z.infer<typeof subjectUpdateSchema>;
