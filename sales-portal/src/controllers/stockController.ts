import type { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class StockController {
  index: RequestHandler = async (_req, res) => {
    try {
      const products = await prisma.product.findMany();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar estoque" });
    }
  };

  update: RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
      const { stock } = req.body;

      const product = await prisma.product.update({
        where: { id: Number(id) },
        data: { stock },
      });

      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar estoque" });
    }
  };
}
