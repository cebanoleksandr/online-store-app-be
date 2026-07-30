import { Controller, Get, Post, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  async getFavorites(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.favoritesService.getUserFavorites(user.id);
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
