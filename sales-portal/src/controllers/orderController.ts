import { prisma } from "../database";
import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";

export class OrderController {
  create = async (req: Request, res: Response) => {
    try {
      const { userId, productId, quantity, city, state } = req.body;

      const user = await prisma.user.findUnique({ where: { id: userId } });
      const product = await prisma.product.findUnique({ where: { id: productId } });

      if (!user || !product)
        return res.status(404).json({ message: "User or Product not found" });

      const totalPrice = product.price * quantity;

      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {

        const order = await tx.order.create({
          data: {
            userId,
            productId,
            quantity,
            totalPrice,
            city,
            state,
            status: "pending",
            statusDetail: "Awaiting payment",
          },
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
            city,
            state,
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
}
