import type { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class SupportController {
  index: RequestHandler = async (_req, res) => {
    try {
      const tickets = await prisma.supportTicket.findMany({
        include: { product: true },
      });
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ error: "Erro ao listar chamados" });
    }
  };

  create: RequestHandler = async (req, res) => {
    try {
      const { clientName, productId, description } = req.body;

      const ticket = await prisma.supportTicket.create({
        data: { clientName, productId, description },
      });

      res.status(201).json(ticket);
    } catch (error) {
      res.status(500).json({ error: "Erro ao abrir chamado" });
    }
  };

  update: RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
      const { status, closedAt } = req.body;

      const updated = await prisma.supportTicket.update({
        where: { id: Number(id) },
        data: { status, closedAt },
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar chamado" });
    }
  };
}
