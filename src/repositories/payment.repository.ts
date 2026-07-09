import { prisma } from "../prisma/prisma";
import { CreatePaymentDto} from "../dtos/payment.dto";
import { PaymentStatus} from "@prisma/client";

export class PaymentRepository {
  async create(data: CreatePaymentDto) {
    return prisma.payment.create({
      data: data,
    });
  }

  async findById(id: string) {
    return prisma.payment.findUnique({
      where: { id },
    });
  }

  async updateStatus(id: string, status: PaymentStatus) {
    return prisma.payment.update({
      where: { id },
      data: { status },
    });
  }
  async updateStripeSessionId(id: string, stripeSessionId: string) {
    return prisma.payment.update({
      where: { id },
      data: { stripeSessionId },
    });
  }
}