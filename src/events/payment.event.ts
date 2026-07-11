export enum PaymentEventType {
    COURSE_PURCHASED = "course.purchased",
    COURSE_REFUNDED = "course.refunded",
    PAYMENT_FAILED = "payment.failed",
    PAYMENT_EXPIRED = "payment.expired",
    PAYMENT_DISPUTED = "payment.disputed"
}

export interface PaymentEventPayload {
    paymentId: string;
    userId: string;
    courseId: string;
}

export interface PaymentEvent {
    eventType: PaymentEventType;
    payload: PaymentEventPayload;
    occurredAt: string;
}