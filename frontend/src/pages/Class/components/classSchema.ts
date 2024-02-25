import * as z from "zod";

export const classCreateSchema = z.object({
  name: z.string({ required_error: "Name is required" }).min(3),
  numeric: z.number({ required_error: "Numeric value is required" }).positive(),
  is_active: z.boolean(),
});

export type IClassCreateFormValues = z.infer<typeof classCreateSchema>;

export const classUpdateSchema = classCreateSchema.partial();
