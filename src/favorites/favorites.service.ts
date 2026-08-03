import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { PaginationQueryDto } from '../products/dto/pagination-query.dto';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
  ) {}

  async getUserFavorites(userId: string, query: PaginationQueryDto) {
    const {
      page = 1,
      limit = 16,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const skip = (page - 1) * limit;

    const qb = this.favoriteRepository
      .createQueryBuilder('favorite')
      .leftJoinAndSelect('favorite.user', 'user')
      .leftJoinAndSelect('favorite.product', 'product')
      .where('user.id = :userId', { userId });

    if (sortBy === 'price' || sortBy === 'name' || sortBy === 'createdAt') {
      qb.orderBy(`product.${sortBy}`, sortOrder);
    } else {
      qb.orderBy('favorite.createdAt', sortOrder);
    }

    qb.skip(skip).take(limit);

    const [favorites, total] = await qb.getManyAndCount();

    const data = favorites.map((fav) => fav.product);

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
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
