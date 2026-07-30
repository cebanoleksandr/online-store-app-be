import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  async createPaymentSession(
    orderId: string,
    amount: number,
    userEmail: string,
  ): Promise<string> {
    this.logger.log(
      `Імітація запиту до Stripe для замовлення ${orderId} на суму $${amount} вiд ${userEmail}`,
    );

    const mockSessionId = `cs_test_${Math.random().toString(36).substring(2, 15)}`;
    const mockPaymentUrl = `https://checkout.stripe.mock/pay/${mockSessionId}?order_id=${orderId}`;

    return mockPaymentUrl;
  }
}
