import { prisma } from "../prisma/prisma";
import { CreatePaymentDto } from "../dtos/payment.dto";
import { Prisma, PaymentStatus } from "@prisma/client";
export class PaymentRepository {
  async create(data: CreatePaymentDto) {
    return prisma.payment.create({
      data: data,
    });
  }

  async findUnique(where: Prisma.PaymentWhereUniqueInput) {
    return prisma.payment.findUnique({
      where,
    });
  }

  async updateStatus(
    where: Prisma.PaymentWhereUniqueInput,
    status: PaymentStatus
  ) {
    return prisma.payment.update({
      where,
      data: { status },
    });
  }
  async update(
    where: Prisma.PaymentWhereUniqueInput,
    data: Prisma.PaymentUpdateInput
  ) {
    return prisma.payment.update({
      where,
      data,
    });
  }
  async findTransactionByUserId(userId: string) {
    return prisma.payment.findMany({
      where: { userId: userId },
    });
  }
}