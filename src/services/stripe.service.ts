import { stripe, stripeWebhookSecret } from "../config/stripe";
import { Payment } from "@prisma/client";


export async function createStripeCheckoutSession(
  payment: Payment
): Promise<any> {
  const unitAmount = Math.round(+payment.amount * 100);
  const session = await stripe.checkout.sessions.create(
    {
      success_url: `${process.env.FRONTEND_URL}/payment/success?`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: payment.currency,
            product_data: {
              name: `Course ID: ${payment.courseId}`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1
        }
      ],
    }
  )
  return session;
}
export async function transactionRefund(payment: Payment) {
  try {
    if (!payment.stripePaymentIntentId) {
      throw new Error("Payment does not have a Stripe Payment Intent ID");
    }
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: +payment.amount * 100 * 0.6, // Convert to cents and refund 60% of the original amount
    });
    return refund;
  }
  catch (error) {
    console.error("Error processing refund:", error);
    throw new Error("Refund failed");
  }
}
export function constructWebhookEvent(
  body: Buffer,
  signature: string
) {
  try {
    return stripe.webhooks.constructEvent(
      body,
      signature,
      stripeWebhookSecret!
    );
  }
  catch (err) {
    console.error("Webhook signature verification failed.", err);
    throw new Error(`Webhook Error: ${err}`);
  }
}