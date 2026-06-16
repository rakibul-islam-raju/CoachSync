import * as z from "zod";

export const scheduleCreateSchema = z.object({
  title: z.string({ error: "Title is required" }),
  subject: z.number({ error: "Subject is required" }),
  batch: z.number({ error: "Batch is required" }),
  teacher: z.number().optional().nullable(),
  exam: z.number().optional().nullable(),
  duration: z.number({ error: "Duration is required" }),
  time: z.string({ error: "Time is required" }),
  date: z.string({ error: "Date is required" }),
});
export type IScheduleCreateFormValues = z.infer<typeof scheduleCreateSchema>;
