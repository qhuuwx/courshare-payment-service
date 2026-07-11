import { Request, Response } from "express";
import * as paymentServices from "../services/payment.service";

export async function createCheckoutSession(
    req: Request,
    res: Response
) {
    // After have course api need to change the amount to be fetched from course api based on courseId
    console.log(`Creating checkout session for user ID: ${req.body.userId}, course ID: ${req.body.courseId}`);
    try {
        const { userId, courseId, amount, currency, provider } = req.body;

        const result = await paymentServices.createCheckoutSession({
            userId,
            courseId,
            amount,
            currency,
            provider
        });

        res.status(200).json({ message: "Stripe Checkout Session created", StripeCheckoutSessionId: result.id, StripeSessionUrl: result.url });
    }catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).send({ message: error instanceof Error ? error.message : "Checkout session creation failed" });
    }
}
export async function verifyCheckout(req: Request, res: Response) {
    const { stripeSessionId } = req.query;
    console.log(`Verifying payment status for Stripe session ID: ${stripeSessionId}`);
    try {
        const paymentStatus = await paymentServices.verifyPaymentStatus(stripeSessionId?.toString() ?? "");
        res.status(200).json({ message: "Payment status retrieved successfully", status: paymentStatus });
    } catch (error) {
        res.status(404).send({ message: error instanceof Error ? error.message : "Payment not found" });
    }
}