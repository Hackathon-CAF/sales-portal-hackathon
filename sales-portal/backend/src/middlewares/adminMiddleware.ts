import type { Request, Response, NextFunction } from "express";

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;

  if (!user) return res.status(401).json({ message: "Não autenticado!" });
  if (user.role !== "admin")
    return res.status(403).json({ message: "Acesso negado: apenas administradores." });

  next();
}
