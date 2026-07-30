import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartItem } from 'src/cart/entities/cart-item.entity';
import { PaymentsModule } from 'src/payments/payments.module';
import { OrdersWebhookController } from './orders-webhook.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, CartItem]),
    PaymentsModule,
  ],
  controllers: [OrdersController, OrdersWebhookController],
  providers: [OrdersService],
})
export class OrdersModule {}
