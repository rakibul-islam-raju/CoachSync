import * as z from "zod";

export const classCreateSchema = z.object({
	name: z.string().min(3).nonempty("Name is required"),
	numeric: z.number({ required_error: "Numeric value is required" }).min(1),
});

export type IClassCreateFormValues = z.infer<typeof classCreateSchema>;

export const classUpdateSchema = z.object({
	name: z.string().min(3).nonempty("Name is required").optional(),
	numeric: z
		.number({ required_error: "Numeric value is required" })
		.min(1)
		.optional(),
});

export type IClassUpdateFormValues = z.infer<typeof classUpdateSchema>;
