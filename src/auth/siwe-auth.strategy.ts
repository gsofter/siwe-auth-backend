import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { ethers } from 'ethers';

import { SiweService } from 'src/siwe/siwe.service';

@Injectable()
export class SiweAuthStrategy extends PassportStrategy(Strategy, 'siwe-auth') {
  constructor(
    private siweService: SiweService,
    @InjectRedis() private readonly redis: Redis,
  ) {
    super();
  }

  async validate(req) {
    const { message, signature, nonce } = req.body;
    if (!message || !signature || !nonce) throw new UnauthorizedException();
    const cached = await this.redis.get(nonce);
    if (cached) throw new UnauthorizedException();

    const parsedMessage = await this.siweService.verifyMessage(
      message,
      signature,
      nonce,
    );

    if (
      ethers.getAddress(parsedMessage.address) !==
      ethers.getAddress(req.body.eoaAddress)
    ) {
      throw new UnauthorizedException();
    }

    this.redis.set(nonce, parsedMessage.address);

    return {
      eoaAddress: parsedMessage.address,
      signature,
    };
  }
}
