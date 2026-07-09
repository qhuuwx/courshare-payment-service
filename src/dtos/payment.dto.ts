import { PaymentStatus, PaymentProvider} from "@prisma/client";

export interface CreatePaymentDto {
    userId: string;
    courseId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    provider: PaymentProvider;
}
