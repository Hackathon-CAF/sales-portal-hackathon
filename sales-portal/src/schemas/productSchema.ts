import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Nome do produto é obrigatório"),
  category: z.string().min(1, "Categoria é obrigatória"),
  price: z.number().min(0, "Preço deve ser maior ou igual a 0"),
  stock: z.number().int().min(0, "Estoque deve ser inteiro e >= 0").optional(), // opcional, default 0
  imageUrl: z.string().optional()
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  imageUrl: z.string().optional()
});