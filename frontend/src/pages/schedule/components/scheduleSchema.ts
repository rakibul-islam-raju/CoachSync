import * as z from "zod";

export const scheduleCreateSchema = z.object({
  title: z.string({ required_error: "Title is required" }),
  subject: z.number({ required_error: "Subject is required" }),
  batch: z.number({ required_error: "Batch is required" }),
  teacher: z.number().optional().nullable(),
  exam: z.number().optional().nullable(),
  duration: z.number({ required_error: "Duration is required" }),
  time: z.string({ required_error: "Time is required" }),
  date: z.string({ required_error: "Date is required" }),
});
export type IScheduleCreateFormValues = z.infer<typeof scheduleCreateSchema>;
