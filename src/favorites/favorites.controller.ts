import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { Request } from 'express';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PaginationQueryDto } from '../products/dto/pagination-query.dto'; // Шлях до вашого DTO

@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  async getFavorites(@Req() req: Request, @Query() query: PaginationQueryDto) {
    const user = req.user as { id: string };
    return this.favoritesService.getUserFavorites(user.id, query);
  }

  @Post(':productId')
  async toggleFavorite(
    @Req() req: Request,
    @Param('productId') productId: string,
  ) {
    const user = req.user as { id: string };
    return this.favoritesService.toggleFavorite(user.id, productId);
  }
}
