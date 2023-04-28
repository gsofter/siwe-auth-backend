import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './user.controller';
import { User } from './user.entity';
import { UserService } from './user.service';
import { SiweService } from 'src/siwe/siwe.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService, SiweService],
  controllers: [UsersController],
})
export class UsersModule {}
