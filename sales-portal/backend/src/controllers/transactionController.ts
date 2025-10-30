import type { RequestHandler } from "express";
import { prisma } from "../database";

// src/controllers/transactionController.ts

export type TransactionWithRelations = {
  id: number;
  quantity: number;
  totalPrice: number;
  city: string;
  state: string;
  user: {
    id: number;
    name: string;
    segment: string;
  };
  product: {
    id: number;
    name: string;
    category: string;
    price: number;
  };
  order: {
    id: number;
    status: string;
    statusDetail: string;
    createdAt: Date;
  };
};

export class TransactionController {
  // GET /transactions
  index: RequestHandler = async (req, res) => {
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
          segment: { equals: String(clientSegment) },
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
      const formatted = transactions.map(t => ({
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

      type FormattedTransaction = typeof formatted[number];

      return res.status(200).json({
        totalRecords: formatted.length,
        generatedAt: new Date(),
        filtersUsed: { startDate, endDate, region, productCategory, clientSegment },
        summary: {
          totalSalesValue: formatted.reduce((acc: number, t: FormattedTransaction) => acc + (t.totalPrice || 0), 0 as number),
          totalQuantitySold: formatted.reduce((acc: number, t: FormattedTransaction) => acc + (t.product.quantity || 0), 0),
          uniqueClients: new Set(formatted.map((t: FormattedTransaction) => t.product.id)).size,
          uniqueProducts: new Set(formatted.map((t: FormattedTransaction) => t.product.id)).size,
        },
        data: formatted,
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return res.status(500).json({ message: "Error fetching transactions." });
    }
  };

  // GET /transactions/:id
  show: RequestHandler = async (req, res) => {
    const { id } = req.params;

    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: Number(id) }
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

  // GET /api/transactions/dashboard
  dashboard: RequestHandler = async (req, res) => {
    const apiKey = req.headers["x-api-key"];

    if (apiKey !== process.env.API_DASHBOARD_KEY) {
      return res.status(403).json({ message: "Acesso negado: API key inválida." });
    }

    try {
      const transactions = await prisma.transaction.findMany({
        include: {
          user: { select: { id: true, name: true, segment: true, city: true, state: true } },
          product: { select: { id: true, name: true, category: true, price: true } },
          order: { select: { id: true, status: true, createdAt: true } },
        },
        orderBy: { id: "desc" },
      });

      const formatted = transactions.map((t) => ({
        transactionId: t.id,
        orderId: t.order?.id,
        date: t.order?.createdAt,
        status: t.order?.status,
        totalPrice: t.totalPrice,
        customer: {
          id: t.user.id,
          name: t.user.name,
          city: t.user.city,
          state: t.user.state,
          segment: t.user.segment,
        },
        product: {
          id: t.product.id,
          name: t.product.name,
          category: t.product.category,
          unitPrice: t.product.price,
        },
      }));

      return res.json({ data: formatted });
    } catch (error) {
      console.error("Erro ao buscar transações do dashboard:", error);
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  };

  // DELETE /transactions/:id
  delete: RequestHandler = async (req, res) => {
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
