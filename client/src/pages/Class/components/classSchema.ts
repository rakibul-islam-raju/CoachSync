import * as z from "zod";

export const classCreateSchema = z.object({
	name: z.string({ required_error: "Name is required" }).min(3),
	numeric: z.number({ required_error: "Numeric value is required" }).positive(),
	is_active: z.boolean(),
});

export type IClassCreateFormValues = z.infer<typeof classCreateSchema>;

export const classUpdateSchema = z.object({
	name: z.string().min(3).nonempty("Name is required").optional(),
	numeric: z
		.number({ required_error: "Numeric value is required" })
		.min(1)
		.optional(),
	is_active: z.boolean(),
});

export type IClassUpdateFormValues = z.infer<typeof classUpdateSchema>;
