import type { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class SalesController {
  index: RequestHandler = async (_req, res) => {
    try {
      const sales = await prisma.sale.findMany({
        include: { product: true },
      });
      res.json(sales);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao listar vendas" });
    }
  };

  create: RequestHandler = async (req, res) => {
    try {
      const { clientName, productId, quantity } = req.body;

      const sale = await prisma.sale.create({
        data: { clientName, productId, quantity },
      });

      await prisma.product.update({
        where: { id: productId },
        data: { stock: { decrement: quantity } },
      });

      res.status(201).json(sale);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao criar venda" });
    }
  };
}
