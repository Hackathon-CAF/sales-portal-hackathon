import z from "zod";

export const PFSchema = z.object({
  clientType: z.literal("PF"),
  name: z.string().min(3, "Nome obrigatório"),
  cpf: z.string().regex(/^\d{11}$/, "CPF deve conter 11 dígitos numéricos"),
  email: z.string().min(5, "E-mail é obrigatório").refine(
    (val) => /^\S+@\S+\.\S+$/.test(val), {
      message: "Formato inválido"
    }
  ),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
  phone: z.string(),

  street: z.string(),
  number: z.string(),
  complement: z.string(),
  district: z.string(),
  city: z.string(),
  state: z.string().length(2)
})

export const PJSchema = z.object({
  clientType: z.literal("PJ"),
  name: z.string().min(3, "Nome obrigatório"),
  cnpj: z.string().regex(/^\d{14}$/, "CNPJ deve conter 14 dígitos numéricos"),
  email: z.string().min(5, "E-mail é obrigatório").refine(
    (val) => /^\S+@\S+\.\S+$/.test(val), {
      message: "Formato inválido"
    }
  ),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
  phone: z.string(),

  street: z.string(),
  number: z.string(),
  complement: z.string(),
  district: z.string(),
  city: z.string(),
  state: z.string().length(2)
})

export const updateUserSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().min(5, "E-mail é obrigatório").refine(
    (val) => /^\S+@\S+\.\S+$/.test(val), {
      message: "Formato inválido"
    }
  ).optional(),
  phone: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  state: z.string().length(2).optional()
});