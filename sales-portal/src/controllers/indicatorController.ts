import type { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class IndicatorController {
  index: RequestHandler = async (_req, res) => {
    try {
      const totalSales = await prisma.sale.count();
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
