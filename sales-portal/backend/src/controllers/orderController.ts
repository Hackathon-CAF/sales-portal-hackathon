import { prisma } from "../database";
import type { RequestHandler } from "express";

export class OrderController {
  userCreate: RequestHandler = async (req, res) => {
    try {
      const user = (req as any).user;
      const userId = user.id;
      const { productId, quantity } = req.body;

      const product = await prisma.product.findUnique({ where: { id: productId } });

      if (!user || !product)
        return res.status(404).json({ message: "User or Product not found" });

      const totalPrice = product.price * quantity;

      const result = await prisma.$transaction(async (tx) => {

        const order = await tx.order.create({
          data: {
            userId,
            productId,
            quantity,
            totalPrice,
            city: user.city,
            state: user.state,
            status: "pending",
            statusDetail: "Awaiting payment",
          },
        });

        await tx.product.update({
          where: { id: productId },
          data: { stock: product.stock - quantity },
        });

        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: { totalSpent: { increment: totalPrice } },
        });

        let newSegment: "Bronze" | "Silver" | "Gold" = "Bronze";
        if (updatedUser.totalSpent > 10000) newSegment = "Gold";
        else if (updatedUser.totalSpent > 5000 && updatedUser.totalSpent <= 10000) newSegment = "Silver";

        if (newSegment !== updatedUser.segment) {
          await tx.user.update({
            where: { id: userId },
            data: { segment: newSegment },
          });
        }

        await tx.transaction.create({
          data: {
            orderId: order.id,
            userId,
            productId,
            orderDate: order.createdAt,
            status: order.status,
            statusDetail: order.statusDetail,
            city: user.city,
            state: user.state,
            clientName: user.name,
            clientSegment: newSegment,
            productName: product.name,
            productCategory: product.category,
            quantity,
            unitPrice: product.price,
            totalPrice,
          },
        });

        return order;
      });

      return res.status(201).json({
        message: "Order and transaction created successfully!",
        order: 
        {
          ...result,
          productName: product.name
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error creating order" });
    }
  };

  listOrders: RequestHandler = async (req, res) => {
    try {
      const { userId, status, startDate, endDate } = req.query;

      const filters: any = {};

      if (userId) {
        filters.userId = Number(userId);
      }

      if (status) {
        filters.status = status;
      }

      if (startDate || endDate) {
        filters.createdAt = {};
        if (startDate) filters.createdAt.gte = new Date(String(startDate));
        if (endDate) filters.createdAt.lte = new Date(String(endDate));
      }

      const orders = await prisma.order.findMany({
        where: filters,
        include: {
          product: true,
          user: { select: { id: true, name: true, city: true, state: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      const result = orders.map((o) => ({
        id: o.id,
        userId: o.userId,
        productId: o.productId,
        quantity: o.quantity,
        totalPrice: o.totalPrice,
        status: o.status,
        statusDetail: o.statusDetail,
        city: o.city ?? o.user?.city,
        state: o.state ?? o.user?.state,
        createdAt: o.createdAt,
        product: o.product,
        user: o.user,
      }));

      res.json(result);
    } catch (error) {
      console.error("Erro ao listar pedidos:", error);
      res.status(500).json({ error: "Erro ao listar pedidos" });
    }
  };

  userOrders: RequestHandler = async (req, res) => {
    try {
      const authUser = (req as any).user;
      if (!authUser) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      // opcional: aceitar filtros via query params
      const { status, startDate, endDate } = req.query;

      const filters: any = { userId: authUser.id };

      if (status) filters.status = status;
      if (startDate || endDate) {
        filters.createdAt = {};
        if (startDate) filters.createdAt.gte = new Date(startDate as string);
        if (endDate) filters.createdAt.lte = new Date(endDate as string);
      }

      const orders = await prisma.order.findMany({
        where: filters,
        orderBy: { createdAt: "desc" },
        include: { product: true } 
      });

      res.json(orders);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao buscar pedidos do usuário" });
    }
  };

  updateOrderStatus: RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
      const { status, statusDetail } = req.body;

      if (!id) {
        return res.status(400).json({ error: "ID do pedido é obrigatório" });
      }

      if (!status && !statusDetail) {
        return res.status(400).json({ error: "Informe status ou statusDetail para atualizar" });
      }

      const order = await prisma.order.findUnique({ where: { id: Number(id) } });
      if (!order) {
        return res.status(404).json({ error: "Pedido não encontrado" });
      }

      const updatedOrder = await prisma.order.update({
        where: { id: Number(id) },
        data: {
          status: status || order.status,
          statusDetail: statusDetail || order.statusDetail,
        },
        include: {
          product: true,
          user: { select: { id: true, name: true, city: true, state: true } },
        },
      });

      res.json({
        message: "Pedido atualizado com sucesso",
        order: updatedOrder,
      });
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error);
      res.status(500).json({ error: "Erro interno ao atualizar o pedido" });
    }
  };
}
