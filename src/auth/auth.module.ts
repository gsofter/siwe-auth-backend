import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { JwtStrategy } from './jwt-auth.strategy';
import { User } from 'src/user/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiweService } from 'src/siwe/siwe.service';
import { SiweAuthStrategy } from './siwe-auth.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: {
        expiresIn: '1d',
      },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UserService, JwtStrategy, SiweService, SiweAuthStrategy],
})
export class AuthModule {}
