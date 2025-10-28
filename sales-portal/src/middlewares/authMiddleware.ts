import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { prisma } from "../database";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.token; // cookieParser precisa estar registrado antes

  if (!token) return res.status(401).json({ message: "Não autorizado!" });

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
