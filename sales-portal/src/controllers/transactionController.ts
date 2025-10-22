import type { Request, Response } from "express";
import { prisma } from "../database";

export class TransactionController {
  // GET /transactions
  index = async (_req: Request, res: Response) => {
    try {
      const transactions = await prisma.transaction.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              segment: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              category: true,
              price: true,
            },
          },
          order: {
            select: {
              id: true,
              status: true,
              statusDetail: true,
              createdAt: true,
            },
          },
        },
        orderBy: { id: "desc" },
      });

      return res.status(200).json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return res.status(500).json({ message: "Error fetching transactions." });
    }
  };

  // GET /transactions/:id
  show = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: Number(id) },
        include: {
          user: true,
          product: true,
          order: true,
        },
      });

      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found." });
      }

      return res.status(200).json(transaction);
    } catch (error) {
      console.error("Error fetching transaction:", error);
      return res.status(500).json({ message: "Error fetching transaction." });
    }
  };

  // DELETE /transactions/:id
  delete = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: Number(id) },
      });

      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found." });
      }

      await prisma.transaction.delete({
        where: { id: Number(id) },
      });

      return res.status(200).json({ message: "Transaction deleted successfully." });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      return res.status(500).json({ message: "Error deleting transaction." });
    }
  };
}
