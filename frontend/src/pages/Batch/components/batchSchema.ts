import * as z from "zod";

export const batchCreateSchema = z.object({
  name: z.string({ error: "Name is required" }),
  code: z.string().optional().nullable(),
  fee: z.number().optional().nullable(),
  classs: z.number({ error: "Class is required" }),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  is_active: z.boolean(),
});

export type IBatchCreateFormValues = z.infer<typeof batchCreateSchema>;
