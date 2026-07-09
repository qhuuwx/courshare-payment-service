// webhook.controller.ts

import { Request, Response } from "express";
import * as paymentService from "../services/payment.service";
import * as stripeService from "../services/stripe.service";

export async function handleStripeWebhook(
  req: Request,
  res: Response
) {
  try {
    const event = stripeService.constructWebhookEvent(
      req.body,
      req.headers["stripe-signature"] as string
    );

    await paymentService.handleStripeWebhookEvent(event);

    res.sendStatus(200);
  }
  catch (err) {
    console.error("Error handling Stripe webhook:", err);
    res.status(400).send(`Webhook Error: ${err}`);
  }
}