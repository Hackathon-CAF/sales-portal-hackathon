import type { Request, Response } from "express";
import { prisma } from "../database";
import type { Prisma } from "@prisma/client";

export class TransactionController {
  // GET /transactions
  index = async (req: Request, res: Response) => {
    try {
      const { startDate, endDate, region, productCategory, clientSegment } = req.query;

      // Mapa de regiões do Brasil
      const regionMap: Record<string, string[]> = {
        norte: ["AC", "AP", "AM", "PA", "RO", "RR", "TO"],
        nordeste: ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"],
        centrooeste: ["DF", "GO", "MT", "MS"],
        sudeste: ["ES", "MG", "RJ", "SP"],
        sul: ["PR", "RS", "SC"],
      };

      // Filtros dinâmicos
      const filters: any = {};

      // Período (data inicial/final)
      if (startDate || endDate) {
        filters.order = {
          createdAt: {
            gte: startDate ? new Date(String(startDate)) : undefined,
            lte: endDate ? new Date(String(endDate)) : undefined,
          },
        };
      }

      // Região geográfica
      if (region) {
        const regionKey = String(region).toLowerCase().replace("-", "");
        const statesInRegion = regionMap[regionKey];
        if (statesInRegion) {
          filters.state = { in: statesInRegion };
        }
      }

      // Categoria de produto
      if (productCategory) {
        filters.product = {
          category: { contains: String(productCategory), mode: "insensitive" },
        };
      }

      // Segmento de cliente
      if (clientSegment) {
        filters.user = {
          segment: { equals: String(clientSegment).toLowerCase() },
        };
      }

      // Consulta Prisma
      const transactions = await prisma.transaction.findMany({
        where: filters,
        include: {
          user: { select: { id: true, name: true, segment: true } },
          product: { select: { id: true, name: true, category: true, price: true } },
          order: { select: { id: true, status: true, statusDetail: true, createdAt: true } },
        },
        orderBy: { id: "desc" },
      });

      // Formatação do resultado
      const formatted = transactions.map((t: Prisma.TransactionClient) => ({
        transactionId: t.id,
        orderId: t.order?.id,
        date: t.order?.createdAt,
        status: t.order?.status,
        statusDetail: t.order?.statusDetail,
        customer: {
          id: t.user.id,
          name: t.user.name,
          segment: t.user.segment,
        },
        product: {
          id: t.product.id,
          name: t.product.name,
          category: t.product.category,
          unitPrice: t.product.price,
          quantity: t.quantity,
        },
        totalPrice: t.totalPrice,
        city: t.city,
        state: t.state,
      }));

      return res.status(200).json({
        totalRecords: formatted.length,
        generatedAt: new Date(),
        filtersUsed: { startDate, endDate, region, productCategory, clientSegment },
        summary: {
          totalSalesValue: formatted.reduce((acc: number, t: Prisma.TransactionClient) => acc + (t.totalPrice || 0), 0 as number),
          totalQuantitySold: formatted.reduce((acc: number, t: Prisma.TransactionClient) => acc + (t.product.quantity || 0), 0),
          uniqueClients: new Set(formatted.map((t: Prisma.TransactionClient) => t.customer.id)).size,
          uniqueProducts: new Set(formatted.map((t: Prisma.TransactionClient) => t.product.id)).size,
        },
        data: formatted,
      });
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
