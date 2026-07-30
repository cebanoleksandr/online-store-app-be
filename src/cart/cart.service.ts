import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { CartItem } from './entities/cart-item.entity';

@Injectable()
export class CartService {
  constructor(
    private readonly redisService: RedisService,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
  ) {}

  private getGuestCartKey(guestId: string): string {
    return `cart:guest:${guestId}`;
  }

  async getGuestCart(guestId: string) {
    const client = this.redisService.getClient();
    const cartData = await client.get(this.getGuestCartKey(guestId));
    return cartData ? JSON.parse(cartData) : [];
  }

  async addItemToGuestCart(
    guestId: string,
    productId: string,
    quantity: number = 1,
  ) {
    const client = this.redisService.getClient();
    const key = this.getGuestCartKey(guestId);
    const cart = await this.getGuestCart(guestId);

    const existingItemIndex = cart.findIndex(
      (item: any) => item.productId === productId,
    );

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }

    await client.set(key, JSON.stringify(cart), 'EX', 604800);
    return cart;
  }

  async clearGuestCart(guestId: string) {
    const client = this.redisService.getClient();
    await client.del(this.getGuestCartKey(guestId));
  }

  async getUserCart(userId: string) {
    return this.cartItemRepository.find({
      where: { user: { id: userId } },
      relations: ['product'],
    });
  }

  async addItemToUserCart(
    userId: string,
    productId: string,
    quantity: number = 1,
  ) {
    let cartItem = await this.cartItemRepository.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });

    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cartItem = this.cartItemRepository.create({
        user: { id: userId },
        product: { id: productId },
        quantity,
      });
    }

    return this.cartItemRepository.save(cartItem);
  }

  async mergeGuestCartIntoUserCart(guestId: string, userId: string) {
    const guestCart = await this.getGuestCart(guestId);

    if (!guestCart || guestCart.length === 0) {
      return this.getUserCart(userId);
    }

    for (const item of guestCart) {
      await this.addItemToUserCart(userId, item.productId, item.quantity);
    }

    await this.clearGuestCart(guestId);

    return this.getUserCart(userId);
  }

  async removeItemFromGuestCart(guestId: string, productId: string) {
    const client = this.redisService.getClient();
    const key = this.getGuestCartKey(guestId);
    let cart = await this.getGuestCart(guestId);

    cart = cart.filter((item: any) => item.productId !== productId);

    await client.set(key, JSON.stringify(cart), 'EX', 604800);
    return cart;
  }

  async removeItemFromUserCart(userId: string, productId: string) {
    await this.cartItemRepository.delete({
      user: { id: userId },
      product: { id: productId },
    });

    return this.getUserCart(userId);
  }

  async updateGuestCartItemQuantity(
    guestId: string,
    productId: string,
    quantity: number,
  ) {
    if (quantity <= 0) {
      return this.removeItemFromGuestCart(guestId, productId);
    }

    const client = this.redisService.getClient();
    const key = this.getGuestCartKey(guestId);
    const cart = await this.getGuestCart(guestId);

    const itemIndex = cart.findIndex(
      (item: any) => item.productId === productId,
    );

    if (itemIndex > -1) {
      cart[itemIndex].quantity = quantity;
      await client.set(key, JSON.stringify(cart), 'EX', 604800);
    }

    return cart;
  }

  async updateUserCartItemQuantity(
    userId: string,
    productId: string,
    quantity: number,
  ) {
    if (quantity <= 0) {
      return this.removeItemFromUserCart(userId, productId);
    }

    const cartItem = await this.cartItemRepository.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });

    if (cartItem) {
      cartItem.quantity = quantity;
      await this.cartItemRepository.save(cartItem);
    }

    return this.getUserCart(userId);
  }
}
