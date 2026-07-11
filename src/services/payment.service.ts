import { PaymentRepository } from "../repositories/payment.repository";
import { PaymentStatus, PaymentProvider } from "@prisma/client";
import { createStripeCheckoutSession, transactionRefund } from "./stripe.service";
import { Stripe } from "stripe/cjs/stripe.core";
import { paymentPublisher } from "../publishers/payment.publisher";
import { PaymentEventType } from "../events/payment.event";
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
  try {
    const pendingPayment = await createPendingPayment(input);
    const stripeSession = await createStripeCheckoutSession(pendingPayment);
    // Update the pending payment record with the Stripe session ID
    await paymentRepository.update(
      { id: pendingPayment.id },
      { stripeSessionId: stripeSession.id }
    );
    return stripeSession;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}
async function createPendingPayment(
  input: CreatePendingPaymentInput
) {
  try {
    return paymentRepository.create({
      ...input,
      status: PaymentStatus.PENDING,
    });
  }
  catch (error) {
    console.error("Error creating pending payment:", error);
    throw new Error("Failed to create pending payment");
  }
}

export async function handleStripeWebhookEvent(
  event: Stripe.Event
) {
  switch (event.type) {

    case "checkout.session.completed":

      {
        const session = event.data.object;
        // Update Payment
        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null;
        await paymentRepository.update({ stripeSessionId: session.id }, { stripePaymentIntentId: paymentIntentId });
        await paymentRepository.updateStatus({ stripeSessionId: session.id }, PaymentStatus.SUCCESS);
        // Publish Event
        const payment = await paymentRepository.findUnique({ stripeSessionId: session.id });
        await paymentPublisher.publish({

          eventType: PaymentEventType.COURSE_PURCHASED,

          occurredAt: new Date().toISOString(),

          payload: {

            paymentId: payment?.id || "Unknown",

            userId: payment?.userId || "Unknown",

            courseId: payment?.courseId || "Unknown"

          }

        });
        break;
      }
    case "payment_intent.payment_failed": {

      // Update FAILED
      const session = event.data.object;
      await paymentRepository.updateStatus({ stripeSessionId: session.id }, PaymentStatus.FAILED);
      // Publish Event
      await paymentPublisher.publish({

        eventType: PaymentEventType.PAYMENT_FAILED,
        occurredAt: new Date().toISOString(),
        payload: {
          paymentId: session.id,
          userId: session.metadata?.userId || "Unknown",
          courseId: session.metadata?.courseId || "Unknown"
        }
      });
      break;
    }
    case "checkout.session.expired": {

      // Update EXPIRED
      const session = event.data.object;
      await paymentRepository.updateStatus({ stripeSessionId: session.id }, PaymentStatus.EXPIRED);
      const payment = await paymentRepository.findUnique({ stripeSessionId: session.id });
      // Publish Event
      await paymentPublisher.publish({
        eventType: PaymentEventType.PAYMENT_EXPIRED,
        occurredAt: new Date().toISOString(),
        payload: {
          paymentId: payment?.id || "Unknown",
          userId: payment?.userId || "Unknown",
          courseId: payment?.courseId || "Unknown"
        }
      });
      break;
    }
    case "charge.refund.updated": {
      const refund = event.data.object;
      const paymentIntentId = refund.payment_intent?.toString() ?? "None";
      const payment = await paymentRepository.findUnique({ stripePaymentIntentId: paymentIntentId });
      if (refund.payment_intent) {
        await paymentRepository.updateStatus({ stripePaymentIntentId: paymentIntentId }, PaymentStatus.REFUNDED);
        await paymentPublisher.publish({
          eventType: PaymentEventType.COURSE_REFUNDED,
          occurredAt: new Date().toISOString(),
          payload: {
            paymentId: payment?.id || "Unknown",
            userId: payment?.userId || "Unknown",
            courseId: payment?.courseId || "Unknown"
          }
        });
      }
      break;
    }
    // default:
    //   console.log(`Unhandled event: ${event.type}`);
    //   throw new Error(`Unhandled event type: ${event.type}`);
  }
}
export async function refundTransaction(stripeSessionId: string) {
  try {
    const payment = await paymentRepository.findUnique({ stripeSessionId: stripeSessionId })?.then(payment => {
      if (!payment) {
        throw new Error("Payment not found");
      }
      return payment;
    });
    if (payment.status === PaymentStatus.REFUNDED) {
      throw new Error("Payment has already been refunded");
    } else if (payment.status !== PaymentStatus.SUCCESS) {
      throw new Error("Only successful payments can be refunded");
    } else {
      const refund = await transactionRefund(payment);
      return refund;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}
export async function verifyPaymentStatus(stripeSessionId: string) {
  try {
    if (stripeSessionId !== "") {
      const payment = await paymentRepository.findUnique({ stripeSessionId: stripeSessionId });
      if (!payment) {
        console.error(`Payment with Stripe session ID ${stripeSessionId} not found`);
        throw new Error("Payment not found");
      }
      return payment.status;
    } else {
      console.error("Stripe session ID is empty");
      throw new Error("Stripe session ID is empty");
    }
  } catch (error) {
    console.error("Error verifying payment status:", error);
    throw error;
  }
}

export async function getTransactionsByUserId(userId: string) {
  try {
    if (userId !== "") {
      {
        const transactions = await paymentRepository.findTransactionByUserId(userId);
        if (!transactions || transactions.length === 0) {
          console.error(`No transactions found for user ID ${userId}`);
          throw new Error("No transactions found for this user");
        }
        return transactions;
      }
    } else {
      console.error("User ID is empty");
      throw new Error("User ID is empty");
    }
  } catch (error) {
    console.error("Error retrieving transactions:", error);
    throw error;
  }
}