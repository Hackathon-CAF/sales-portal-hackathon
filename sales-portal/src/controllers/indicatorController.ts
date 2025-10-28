import type { RequestHandler } from "express";
import { prisma } from "../database"

export class IndicatorController {
  index: RequestHandler = async (_req, res) => {
    try {
      const totalSales = await prisma.transaction.count();
      const totalOpenTickets = await prisma.supportTicket.count({
        where: { status: "open" },
      });
      const avgStock = await prisma.product.aggregate({
        _avg: { stock: true },
      });

      res.json({
        totalSales,
        totalOpenTickets,
        avgStock: avgStock._avg.stock ?? 0,
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao gerar indicadores" });
    }
  };
}
