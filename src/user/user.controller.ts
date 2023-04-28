import { Controller, Get, Post } from '@nestjs/common';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
  @Get('/profile')
  async getProfile() {
    return;
  }

  @Post('/signup')
  async signup() {
    return;
  }

  @Post('/signin')
  async signin() {
    return;
  }
}
