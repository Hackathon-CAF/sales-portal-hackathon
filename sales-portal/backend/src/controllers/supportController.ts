import type { RequestHandler } from "express";
import { prisma } from "../database"
import { createMessageSchema, updateSupportTicketSchema } from "../schemas/supportSchema";
import z from "zod";
import { MessageSender } from "../generated/prisma";

export class SupportController {
  index: RequestHandler = async (_req, res) => {
    try {
      const tickets = await prisma.supportTicket.findMany({
        include: {
          product: {
            select: { id: true, name: true, category: true },
          },
        },
        orderBy: { openedAt: "desc" },
      });

      // Pega os usuários únicos que aparecem nos tickets
      const userIds = [...new Set(tickets.map(t => t.userId))];

      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true },
      });

      // Mapeia o nome do usuário para cada ticket, mantendo userId no mesmo nível
      const ticketsWithUserName = tickets.map(t => ({
        id: t.id,
        userId: t.userId,
        userName: users.find(u => u.id === t.userId)?.name || "Desconhecido",
        productId: t.productId,
        description: t.description,
        status: t.status,
        openedAt: t.openedAt,
        closedAt: t.closedAt,
        product: t.product, // já inclui id, name, category
      }));

      res.json(ticketsWithUserName);
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

  sendMessage: RequestHandler = async (req, res) => {
    try {
      const ticketId = Number(req.params.id);
      const { content } = createMessageSchema.parse(req.body);

      const authUser = (req as any).user as { id: number; role: "admin" | "user" };

      if (!authUser) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      // Verifica se o ticket existe
      const ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
      });

      if (!ticket) {
        return res.status(404).json({ error: "Chamado não encontrado" });
      }

      // Define o sender com base no papel do usuário
      const sender: MessageSender = authUser.role === "admin" ? "admin" : "user";

      // Cria a mensagem
      const message = await prisma.ticketMessage.create({
        data: {
          ticketId,
          sender,
          content: content.trim(), // remove espaços vazios
        },
      });

      // Retorna a mensagem criada diretamente (não dentro de `data`)
      return res.status(201).json({
        message,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Erro de validação", details: error.issues });
      }

      console.error(error);
      return res.status(500).json({ error: "Erro ao enviar mensagem" });
    }
  };


  getMessages: RequestHandler = async (req, res) => {
    try {
      const ticketId = Number(req.params.id);
      const messages = await prisma.ticketMessage.findMany({
        where: { ticketId },
        orderBy: { createdAt: "asc" }
      });
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar mensagens" });
    }
  };
}
