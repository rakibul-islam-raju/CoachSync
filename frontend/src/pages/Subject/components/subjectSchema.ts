import * as z from "zod";

export const subjectCreateSchema = z.object({
  name: z.string({ error: "Name is required" }).min(3),
  code: z.string({ error: "Code is required" }),
  is_active: z.boolean(),
});

export type ISubjectCreateFormValues = z.infer<typeof subjectCreateSchema>;

export const subjectUpdateSchema = subjectCreateSchema.partial();
