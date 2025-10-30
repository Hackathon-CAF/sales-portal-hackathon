import { Request, Response, NextFunction } from "express";

export const dashboardAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiKeyHeader = req.headers["x-api-key"];
  const validApiKey = process.env.API_DASHBOARD_KEY;

  if (!apiKeyHeader || apiKeyHeader !== validApiKey) {
    return res.status(401).json({ message: "Acesso negado: chave de API inválida." });
  }

  next();
};