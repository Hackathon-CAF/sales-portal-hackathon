import type { RequestHandler } from "express";
import { prisma } from "../database"

export class ProductionController {
  index: RequestHandler = async (_req, res) => {
    try {
      const productions = await prisma.production.findMany({
        include: { product: true },
      });
      res.json(productions);
    } catch (error) {
      res.status(500).json({ error: "Erro ao listar produções" });
    }
  };

  create: RequestHandler = async (req, res) => {
    try {
      const { productId, quantityPlanned } = req.body;

      const production = await prisma.production.create({
        data: { productId, quantityPlanned },
      });

      res.status(201).json(production);
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar plano de produção" });
    }
  };

  updateStatus: RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
      const { status, quantityProduced } = req.body;

      const updated = await prisma.production.update({
        where: { id: Number(id) },
        data: { status, quantityProduced },
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar produção" });
    }
  };
}
