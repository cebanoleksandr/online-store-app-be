import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('webhooks/orders')
export class OrdersWebhookController {
  private readonly logger = new Logger(OrdersWebhookController.name);

  constructor(private readonly ordersService: OrdersService) {}

  @Post('stripe')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Body() body: any,
  ) {
    this.logger.log('Отримано Webhook від платіжної системи');

    if (!body.orderId || !body.status) {
      throw new BadRequestException('Неправильний формат даних Webhook');
    }

    await this.ordersService.updateOrderStatus(body.orderId, body.status);

    this.logger.log(
      `Статус замовлення ${body.orderId} успішно змінено на ${body.status}`,
    );

    return { received: true };
  }
}
