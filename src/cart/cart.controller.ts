import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  UseGuards,
  Delete,
  Param,
  Patch,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get('guest')
  async getGuestCart(@Query('guestId') guestId: string) {
    if (!guestId) return [];
    return this.cartService.getGuestCart(guestId);
  }

  @Post('guest/add')
  async addToGuestCart(
    @Query('guestId') guestId: string,
    @Body() body: { productId: string; quantity: number },
  ) {
    return this.cartService.addItemToGuestCart(
      guestId,
      body.productId,
      body.quantity || 1,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async getUserCart(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.cartService.getUserCart(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('user/add')
  async addToUserCart(
    @Req() req: Request,
    @Body() body: { productId: string; quantity: number },
  ) {
    const user = req.user as { id: string };
    return this.cartService.addItemToUserCart(
      user.id,
      body.productId,
      body.quantity || 1,
    );
  }

  @Delete('guest/remove/:productId')
  async removeFromGuestCart(
    @Query('guestId') guestId: string,
    @Param('productId') productId: string,
  ) {
    if (!guestId) return [];
    return this.cartService.removeItemFromGuestCart(guestId, productId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('user/remove/:productId')
  async removeFromUserCart(
    @Req() req: Request,
    @Param('productId') productId: string,
  ) {
    const user = req.user as { id: string };
    return this.cartService.removeItemFromUserCart(user.id, productId);
  }

  @Patch('guest/update')
  async updateGuestCartQuantity(
    @Query('guestId') guestId: string,
    @Body() body: { productId: string; quantity: number },
  ) {
    if (!guestId) return [];
    return this.cartService.updateGuestCartItemQuantity(
      guestId,
      body.productId,
      body.quantity,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('user/update')
  async updateUserCartQuantity(
    @Req() req: Request,
    @Body() body: { productId: string; quantity: number },
  ) {
    const user = req.user as { id: string };
    return this.cartService.updateUserCartItemQuantity(
      user.id,
      body.productId,
      body.quantity,
    );
  }
}
