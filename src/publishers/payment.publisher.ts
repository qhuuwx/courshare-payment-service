import {
    SendMessageCommand
} from "@aws-sdk/client-sqs";

import { sqsClient } from "../config/sqs";

import { PaymentEvent } from "../events/payment.event";

export class PaymentPublisher {

    async publish(event: PaymentEvent): Promise<void> {

        const command = new SendMessageCommand({

            QueueUrl: process.env.PAYMENT_EVENTS_QUEUE_URL,

            MessageBody: JSON.stringify(event)

        });

        await sqsClient.send(command);
    }

}
export const paymentPublisher = new PaymentPublisher();