import { z } from "zod";

const registerOrganizationZodSchema = z.object({
  body: z.object({
    organization: z.object({
      name: z.string({
        required_error: "Name is required",
      }),
      phone: z.string({
        required_error: "Phone is required",
      }),
      email: z.string({
        required_error: "Email is required",
      }),
      tagline: z.string().optional(),
      description: z.string().optional(),
      logo: z.string().optional(),
    }),
    // TODO: add user
  }),
});

export const OrganizationValidation = {
  registerOrganizationZodSchema,
};
