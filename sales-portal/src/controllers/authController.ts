import type { RequestHandler } from "express";
import { prisma } from "../database"
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt";

export class AuthController {

  register: RequestHandler = async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: "E-mail já registrado." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role || "user", // "admin" ou "user"
        },
      });

      res.status(201).json({ message: "Usuário criado com sucesso", user });
    } catch (error) {
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

      res.json({
        message: "Login realizado com sucesso",
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao realizar login" });
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

  showUsers: RequestHandler = async (_req, res) => {
    try {
      const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
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
}
