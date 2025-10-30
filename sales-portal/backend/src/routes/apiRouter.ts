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
import { dashboardAuthMiddleware } from "../middlewares/dashboardAuthMiddleware";

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
router.post("/logout", authMiddleware, auth.logout)
router.get("/profile", authMiddleware, auth.profile);

router.get("/users", authMiddleware, adminMiddleware, auth.showUsers);
router.put("/users", authMiddleware, auth.updateUser);
router.put("/users/role", authMiddleware, adminMiddleware, auth.updateRole);

router.get("/order", authMiddleware, orders.userOrders);
router.get("/order/admin", authMiddleware, adminMiddleware, orders.listOrders);
router.post("/order/user", authMiddleware, orders.userCreate);
router.put("/order/:id", authMiddleware, adminMiddleware, orders.updateOrderStatus);


router.get("/stock", authMiddleware, stock.index);
router.post("/stock", authMiddleware, adminMiddleware, stock.create);
router.put("/stock/:id", authMiddleware, adminMiddleware, stock.update);

router.get("/transactions/admin", authMiddleware, adminMiddleware, transaction.index);
router.get("/transactions/dashboard", dashboardAuthMiddleware, transaction.dashboard);
router.get("/transactions/:id", authMiddleware, adminMiddleware, transaction.show);
router.delete("/transactions/:id", authMiddleware, adminMiddleware, transaction.delete);

router.get("/production", authMiddleware, production.index);
router.post("/production", authMiddleware, adminMiddleware, production.create);
router.put("/production/:id", authMiddleware, adminMiddleware, production.updateStatus);

router.get("/support", authMiddleware, support.getUserTickets)
router.get("/support/admin", authMiddleware, adminMiddleware, support.index);
router.post("/support", authMiddleware, support.create);
router.put("/support/:id", authMiddleware, adminMiddleware, support.update);
router.post("/support/:id/message", authMiddleware, support.sendMessage)
router.get("/support/:id/message", authMiddleware, support.getMessages)

router.get("/indicators", authMiddleware, adminMiddleware,indicators.index);

export default router;
