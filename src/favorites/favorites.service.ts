import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
  ) {}

  async getUserFavorites(userId: string) {
    const favorites = await this.favoriteRepository.find({
      where: { user: { id: userId } },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });

    return favorites.map((fav) => fav.product);
  }

  async toggleFavorite(userId: string, productId: string) {
    const existingFavorite = await this.favoriteRepository.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });

    if (existingFavorite) {
      await this.favoriteRepository.remove(existingFavorite);
      return { isFavorite: false, message: 'Товар видалено з обраного' };
    } else {
      const newFavorite = this.favoriteRepository.create({
        user: { id: userId },
        product: { id: productId },
      });
      await this.favoriteRepository.save(newFavorite);
      return { isFavorite: true, message: 'Товар додано до обраного' };
    }
  }
}
