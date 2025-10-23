import type { RequestHandler } from "express";
import { prisma } from "../database"

export class StockController {
  index: RequestHandler = async (_req, res) => {
    try {
      const products = await prisma.product.findMany();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar estoque" });
    }
  };

  create: RequestHandler = async (req, res) => {
    try {
      const { name, category, price, stock } = req.body;

      if (!name || !category || !price || !stock) {
        return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
      }

      const product = await prisma.product.create({
        data: {
          name,
          category,
          price,
          stock // "admin" ou "user"
        },
      });

      res.status(201).json({ message: "Produto registrado com sucesso", product });
    } catch (error: any) {

      if (error.code === "P2002" && error.meta?.target?.includes("name")) {
        return res.status(400).json({ message: "Produto com esse nome já existe." });
      }

      console.error(error);
      res.status(500).json({ error: "Erro ao registrar produto" });
    }
  };

  update: RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
      const { stock } = req.body;

      const product = await prisma.product.update({
        where: { id: Number(id) },
        data: { stock },
      });

      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar estoque" });
    }
  };
}
