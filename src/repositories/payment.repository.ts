import { prisma } from "../prisma/prisma";
import { CreatePaymentDto } from "../dtos/payment.dto";
import { Prisma, PaymentStatus } from "@prisma/client";
export class PaymentRepository {
  async create(data: CreatePaymentDto) {
    try
    {return prisma.payment.create({
      data: data,
    });}catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  }

  async findUnique(where: Prisma.PaymentWhereUniqueInput) {
    try {
      return prisma.payment.findUnique({
        where,
      });
    } catch (error) {
      console.error("Error finding unique payment:", error);
      throw error;
    }
  }

  async updateStatus(
    where: Prisma.PaymentWhereUniqueInput,
    status: PaymentStatus) {
    try {
      return prisma.payment.update({
        where,
        data: { status },
      });
    } catch (error) {
      console.error("Error updating payment:", error);
      throw error;
    }
  }
  async update(
    where: Prisma.PaymentWhereUniqueInput,
    data: Prisma.PaymentUpdateInput) {
    try {
      return prisma.payment.update({
        where,
        data,
      });
    }
    catch (error) {
      console.error("Error updating payment:", error);
      throw error;
    }
  }
  async findTransactionByUserId(userId: string) {
    try {
      return prisma.payment.findMany({
        where: { userId: userId },
      });
    } catch (error) {
      console.error("Error retrieving transactions:", error);
      throw error;
    }
  }
}