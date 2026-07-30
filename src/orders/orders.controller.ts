import { Controller, Post, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  async checkout(@Req() req: Request) {
    const user = req.user as { id: string; email: string };
    return this.ordersService.checkout(user.id, user.email);
  }

  @Get()
  async getMyOrders(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.ordersService.getUserOrders(user.id);
  }
}
