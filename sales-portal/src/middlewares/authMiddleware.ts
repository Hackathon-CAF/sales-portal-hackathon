import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { prisma } from "../database";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Não autorizado!" });

  const token = authHeader.split(" ")[1];

  try {
    const { id } = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) return res.status(404).json({ message: "Usuário não encontrado!" });

    (req as any).user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido!" });
  }
}
