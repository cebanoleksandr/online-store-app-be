import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentsService } from '../payments/payments.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartItem } from 'src/cart/entities/cart-item.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly paymentsService: PaymentsService,
  ) {}

  async checkout(userId: string, userEmail: string) {
    const cartItems = await this.cartItemRepository.find({
      where: { user: { id: userId } },
      relations: ['product'],
    });

    if (!cartItems || cartItems.length === 0) {
      throw new BadRequestException(
        'Кошик порожній, неможливо оформити замовлення',
      );
    }

    const totalPrice = cartItems.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    );

    const order = this.orderRepository.create({
      user: { id: userId },
      totalPrice,
      status: 'pending',
    });
    const savedOrder = await this.orderRepository.save(order);

    const orderItems = cartItems.map((cartItem) => {
      return this.orderItemRepository.create({
        order: savedOrder,
        product: cartItem.product,
        quantity: cartItem.quantity,
        price: cartItem.product.price,
      });
    });
    await this.orderItemRepository.save(orderItems);

    await this.cartItemRepository.remove(cartItems);

    const paymentUrl = await this.paymentsService.createPaymentSession(
      savedOrder.id,
      totalPrice,
      userEmail,
    );

    return {
      orderId: savedOrder.id,
      totalPrice: savedOrder.totalPrice,
      status: savedOrder.status,
      paymentUrl: paymentUrl,
    };
  }

  async getUserOrders(userId: string) {
    return this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateOrderStatus(orderId: string, status: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Замовлення з ID ${orderId} не знайдено`);
    }

    order.status = status;
    await this.orderRepository.save(order);

    return order;
  }
}
