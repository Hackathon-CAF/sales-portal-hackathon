import type { RequestHandler } from "express";
import { prisma } from "../database"
import z from "zod";
import { createProductSchema, updateProductSchema } from "../schemas/productSchema";

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
      const data = createProductSchema.parse(req.body);

      const product = await prisma.product.create({ data });

      res.status(201).json({ message: "Produto registrado com sucesso", product });
    } catch (error: any) {

      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Erro de validação", details: error.issues });
      }

      else if (error.code === "P2002") {
        if (error.meta?.target?.includes("name")) {
          return res.status(400).json({ message: "Produto com esse nome já existe." });
        }
      }

      console.error(error);
      res.status(500).json({ error: "Erro ao criar produto" });
    }
  };

  update: RequestHandler = async (req, res) => {
    try {
      const productId  = Number(req.params.id);
      const data = updateProductSchema.parse(req.body);

    // Atualiza apenas campos enviados
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data
      });

      res.json({ message: "Produto atualizado com sucesso", updatedProduct });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Erro de validação", details: error.issues });
      }
      console.error(error);
      res.status(500).json({ error: "Erro ao atualizar produto" });
    }
  };
}
