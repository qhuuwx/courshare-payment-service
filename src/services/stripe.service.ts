import { stripe,stripeWebhookSecret} from "../config/stripe";
import { Payment } from "@prisma/client";


export async function createStripeCheckoutSession(
  payment: Payment
): Promise<any> {
  const unitAmount = Math.round(+payment.amount * 100);
  const session = await stripe.checkout.sessions.create(
    {
      success_url: `${process.env.FRONTEND_URL}/payment/success`,
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

export function constructWebhookEvent(
    body: Buffer,
    signature: string
) {
    return stripe.webhooks.constructEvent(
        body,
        signature,
        stripeWebhookSecret!
    );
}