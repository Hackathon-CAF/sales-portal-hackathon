import { z } from "zod";

export const updateSupportTicketSchema = z.object({
  status: z.enum(["open", "in_progress", "closed"]).optional(),
  closedAt: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
  }, z.date().optional())
});

export const createMessageSchema = z.object({
  content: z.string().min(1, "A mensagem não pode estar vazia"),
});