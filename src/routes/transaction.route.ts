import { Router } from "express";
import { getTransactionsByUserId, transactionRefund } from "../controllers/transaction.controller";
const router = Router();

router.get("/",getTransactionsByUserId);
router.post("/:Id/refund", transactionRefund)
export default router;