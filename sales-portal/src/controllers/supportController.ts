import type { RequestHandler } from "express";
import { prisma } from "../database"
import { updateSupportTicketSchema } from "../schemas/supportSchema";

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

  getUserTickets: RequestHandler = async (req, res) => {
    try {
      const authUser = (req as any).user;
      if (!authUser) return res.status(401).json({ error: "Não autenticado" });

      const tickets = await prisma.supportTicket.findMany({
        where: { userId: authUser.id },
        include: { product: true },
      });

      res.json(tickets);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao buscar chamados" });
    }
  };

  create: RequestHandler = async (req, res) => {
    try {
      const authUser = (req as any).user;
      if (!authUser) return res.status(401).json({ error: "Não autenticado" });

      const { productId, description } = req.body;

      const ticket = await prisma.supportTicket.create({
        data: {
          userId: authUser.id,
          productId: Number(productId),
          description,
          status: "open" // assumindo status inicial
        },
      });

      res.status(201).json(ticket);
    } catch (error) {
      res.status(500).json({ error: "Erro ao abrir chamado" });
    }
  };

  update: RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
      const data = updateSupportTicketSchema.parse(req.body);

      const updated = await prisma.supportTicket.update({
        where: { id: Number(id) },
        data
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar chamado" });
    }
  };
}
