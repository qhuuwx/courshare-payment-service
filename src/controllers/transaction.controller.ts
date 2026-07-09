import { Request, Response } from "express";
import * as paymentService from "../services/payment.service";

export async function getTransactionsByUserId(req: Request, res: Response) {
  const { userId } = req.query;
  console.log(`Fetching transactions for user ID: ${userId}`);
  try {
    const transactions = await paymentService.getTransactionsByUserId(userId?.toString() ?? "");
    res.status(200).json({ message: "Transactions retrieved successfully", transactions });
  } catch (error) {
    res.status(404).json({ message: "Transactions not found" });
  }
}


export async function transactionRefund(req: Request, res: Response) {
  const {Id} = req.params;
  console.log(`Processing refund for Stripe session ID: ${Id}`);
  try {
    const refund = await paymentService.refundTransaction(Id);
    res.status(200).json({ message: "Refund processed successfully", refund });
  } catch (error) {
    res.status(400).json({ message: "Refund failed" });
  }
}