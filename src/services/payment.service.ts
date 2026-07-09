import { PaymentRepository } from "../repositories/payment.repository";
import { PaymentStatus, PaymentProvider } from "@prisma/client";
import { createStripeCheckoutSession } from "./stripe.service";
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