import express from "express";
import { AuthController } from "../controllers/authController";
import { OrderController } from "../controllers/orderController";
import { StockController } from "../controllers/stockController";
import { TransactionController } from "../controllers/transactionController";
import { ProductionController } from "../controllers/productionController";
import { SupportController } from "../controllers/supportController";
import { IndicatorController } from "../controllers/indicatorController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";

const router = express.Router();

const auth = new AuthController();
const orders = new OrderController();
const stock = new StockController();
const transaction = new TransactionController();
const production = new ProductionController();
const support = new SupportController();
const indicators = new IndicatorController();

router.post("/register", auth.register);
router.post("/login", auth.login);
router.get("/profile", authMiddleware, auth.profile);

router.post("/orders", authMiddleware, orders.create);

router.get("/stock", authMiddleware, stock.index);
router.put("/stock/:id", authMiddleware, adminMiddleware, stock.update);

router.get("/transactions", authMiddleware, adminMiddleware, transaction.index);
router.get("/transactions/:id", authMiddleware, adminMiddleware, transaction.show);
router.delete("/transactions/:id", authMiddleware, adminMiddleware, transaction.delete);

router.get("/production", authMiddleware, production.index);
router.post("/production", authMiddleware, adminMiddleware, production.create);
router.put("/production/:id", authMiddleware, adminMiddleware, production.updateStatus);

router.get("/support", authMiddleware, support.index);
router.post("/support", support.create);
router.put("/support/:id", authMiddleware, support.update);

router.get("/indicators", authMiddleware, indicators.index);

export default router;
