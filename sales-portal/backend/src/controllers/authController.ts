import type { RequestHandler } from "express";
import { prisma } from "../database"
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt";
import z, { ZodError } from "zod";
import { PFSchema, PJSchema, updateUserSchema } from "../schemas/userSchema";

const userSchema = z.union([PFSchema, PJSchema]);

export class AuthController {

  register: RequestHandler = async (req, res) => {
    try {
      const data = userSchema.parse(req.body);

      if (!data.clientType || 
        !data.name || 
        !data.email || 
        !data.password || 
        !data.phone || 
        !data.street || 
        !data.number || 
        !data.complement || 
        !data.district || 
        !data.city || 
        !data.state ) {
        return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
      }

      const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingUser) {
        return res.status(400).json({ error: "E-mail já registrado." });
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = await prisma.user.create({
        data: {
          ...data,
          password: hashedPassword
        }
      });

      res.status(201).json({ message: "Usuário criado com sucesso", user });
    } catch (error) {
      if (error instanceof ZodError) {
        // Mostra todos os erros de validação
        console.error("Erro de validação Zod:", error.issues);

        return res.status(400).json({
          error: "Erro de validação",
          details: error.issues // array com { path, message, code }
        });
      }

      console.error(error);
      res.status(500).json({ error: "Erro ao registrar usuário" });
    }
  };

  login: RequestHandler = async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Senha incorreta" });
      }

      const token = generateToken({
        id: user.id,
        role: user.role as "admin" | "user"
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 1 dia
      });

      res.json({
        message: "Login realizado com sucesso",
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao realizar login" });
    }
  };

  logout: RequestHandler = async (_req, res) => {
    try {
      // Apaga o cookie definindo maxAge para 0
      res.cookie("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 0,
        sameSite: "lax", // ou "strict" se preferir
      });

      return res.json({ message: "Logout realizado com sucesso" });
    } catch (error) {
      console.error("Erro ao deslogar:", error);
      return res.status(500).json({ error: "Erro ao deslogar" });
    }
  };

  profile: RequestHandler = async (req, res) => {
    try {
      const authUser = (req as any).user;

      if (!authUser) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const userId = authUser.id;

      const user = await prisma.user.findUnique({
        where: { id: userId},
        include: {
          orders: true
        }
      })

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar perfil" });
    }
  };

  updateUser: RequestHandler = async (req, res) => {
    try {
      const authUser = (req as any).user;

      if (!authUser) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const data = updateUserSchema.parse(req.body);

      // Atualiza apenas os campos enviados
      const updatedUser = await prisma.user.update({
        where: { id: authUser.id },
        data
      });

      res.json({ message: "Perfil atualizado com sucesso", updatedUser });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Erro de validação", details: error.issues });
      }
      console.error(error);
      res.status(500).json({ error: "Erro ao atualizar perfil" });
    }
  };

  showUsers: RequestHandler = async (_req, res) => {
    try {
      const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        city: true,
        state: true,
        role: true,
        segment: true,
        totalSpent: true
      },
    });
      return res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Erro ao listar usuários" });
    }
  };

  updateRole: RequestHandler = async (req, res) => {
    try {
      const { email, role } = req.body;

      if (!["admin", "user"].includes(role)) {
        return res.status(400).json({ error: "Role inválida" });
      }

      if (email === "admin@admin.com" && role !== "admin") {
        return res.status(403).json({ error: "Não é permitido alterar o papel do admin padrão" });
      }
      
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { role }
      })

      res.status(200).json({ message: `Usuário atualizado para ${role}`, updatedUser });
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar o papel do usuário" });
    }
  }
}
