import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: Request) {
    const user = req.user as { id: string };

    const fullUser = await this.usersService.findById(user.id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = fullUser;

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers() {
    const users = await this.usersService.findAll();
    // Видаляємо паролі перед відправкою масиву
    return users.map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...result } = user;
      return result;
    });
  }

  @Roles(UserRole.ADMIN)
  @Post('admin')
  async createAdmin(@Body() dto: CreateUserDto) {
    const newAdmin = await this.usersService.createAdmin(
      dto.email,
      dto.password,
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = newAdmin;
    return result;
  }
}
