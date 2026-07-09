import { PaymentRepository } from "../repositories/payment.repository";
import { PaymentStatus, PaymentProvider } from "@prisma/client";
import { createStripeCheckoutSession } from "./stripe.service";
import { Stripe } from "stripe/cjs/stripe.core";
const paymentRepository = new PaymentRepository();

interface CreatePendingPaymentInput {
  userId: string;
  courseId: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
}

export async function createCheckoutSession(input: CreatePendingPaymentInput) {
  // Create a pending payment record in the database
  const pendingPayment = await createPendingPayment(input);
  const stripeSession = await createStripeCheckoutSession(pendingPayment);
  // Update the pending payment record with the Stripe session ID
  await paymentRepository.updateStripeSessionId(pendingPayment.id, stripeSession.id);
  return stripeSession;
}
async function createPendingPayment(
  input: CreatePendingPaymentInput
) {
  return paymentRepository.create({
    ...input,
    status: PaymentStatus.PENDING,
  });
}

export async function handleStripeWebhookEvent(
  event: Stripe.Event
) {
  switch (event.type) {

    case "checkout.session.completed":

      {
        const session = event.data.object;

        // Update Payment
        await paymentRepository.updateStatus(session.id, PaymentStatus.SUCCESS);
        // Publish Event

        break;
      }
    case "payment_intent.payment_failed": {

      // Update FAILED
      const session = event.data.object;
      await paymentRepository.updateStatus(session.id, PaymentStatus.FAILED);

      break;
    }
    default:
      console.log(`Unhandled event: ${event.type}`);
      throw new Error(`Unhandled event type: ${event.type}`);
  }
}
export async function verifyPaymentStatus(stripeSessionId: string) {
  const payment = await paymentRepository.findById(stripeSessionId);
  if (!payment) {
    throw new Error("Payment not found");
  }
  return payment.status;
}