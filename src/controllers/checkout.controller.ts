import { Request, Response } from "express";
import * as paymentServices from "../services/payment.service";

export async function createCheckoutSession(
    req: Request,
    res: Response
) {
    const { userId, courseId, amount, currency, provider } = req.body;

    const result = await paymentServices.createCheckoutSession({
        userId,
        courseId,
        amount,
        currency,
        provider
    });

    res.status(200).json({ message: "Stripe Checkout Session created", StripeCheckoutSessionId: result.id, StripeSessionUrl: result.url });
}
export async function verifyCheckout(req: Request, res: Response) {
    const { stripeSessionId } = req.params;

    try {
        const paymentStatus = await paymentServices.verifyPaymentStatus(stripeSessionId);
        res.status(200).json({ message: "Payment status retrieved successfully", status: paymentStatus });
    } catch (error) {
        res.status(404).json({ message: "Payment not found" });
    }
}