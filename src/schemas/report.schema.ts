import * as z from "zod";

export const reportSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters"),
  category: z
    .string()
    .min(1, "Category is required"),
  amountLost: z
    .number()
    .nullable()
    .optional(),
  incidentDate: z
    .string()
    .nullable()
    .optional(),
  isAnonymous: z
    .boolean()
    .default(true),
  entityValue: z
    .string()
    .min(1, "Scam entity detail (phone/bank) is required"),
  entityType: z
    .enum(["PHONE", "BANK", "USERNAME", "BUSINESS"]),
});

export type ReportFields = z.infer<typeof reportSchema>;
