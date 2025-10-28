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
        order: result,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error creating order" });
    }
  };

  adminCreate: RequestHandler = async (req, res) => {
    try {
      const { userId, productId, quantity } = req.body;

      const user = await prisma.user.findUnique({ where: { id: userId } });
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
        else if (updatedUser.totalSpent > 5000) newSegment = "Silver";

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
        order: result,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error creating order" });
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
}
