import {
  Controller,
  Get,
  Post,
  Request,
  Logger,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

// ** import internal dependencies
import { UserService } from './user.service';
import { SiweService } from 'src/siwe/siwe.service';
import { UserDTO } from './user.dto';
import { ethers } from 'ethers';

import { JwtAuthGuard } from '../auth/jwt.guard';
import { JwtService } from '@nestjs/jwt';

@Controller('user')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private readonly userService: UserService,
    private readonly siweService: SiweService,
    private readonly jwtService: JwtService,
  ) {}
  @Get('/nonce')
  async getNonce(@Request() req, @Res() res) {
    const nonce = this.siweService.getSiweNonce();
    this.logger.verbose('nonce', nonce);

    res.status(200).json({ nonce });
  }

  @Post('/signup')
  async signup(@Request() req, @Res() res: Response) {
    if (!req.body.message) {
      return res
        .status(422)
        .json({ message: 'Expected prepareMessage object as body.' });
    }

    if (!req.body.signature) {
      return res.status(422).json({ message: 'Expected signature as body.' });
    }

    if (!req.body.nonce) {
      return res.status(422).json({ message: 'Expected nonce as body.' });
    }

    if (!req.body.username || !req.body.eoaAddress) {
      return res.status(400).json({ message: 'Missing required information.' });
    }

    try {
      const parsedMessage = await this.siweService
        .verifyMessage(req.body.message, req.body.signature, req.body.nonce)
        .catch((e) => {
          this.logger.error(e.message);
          throw new Error('signature verification failed');
        });

      if (
        ethers.getAddress(parsedMessage.address) !==
        ethers.getAddress(req.body.eoaAddress)
      ) {
        return res.status(401).json({ message: 'Authentication failed.' });
      }

      const newUserDto: UserDTO = {
        username: req.body.username,
        eoaAddress: ethers.getAddress(req.body.eoaAddress),
      };

      const newUser = await this.userService.insertOne(newUserDto);

      const jwtToken = this.jwtService.sign(
        {
          eoaAddress: newUser.eoaAddress,
        },
        {
          secret: process.env.JWT_SECRET_KEY,
          expiresIn: '1d',
        },
      );

      res.status(200).json({
        access_token: jwtToken,
      });
    } catch (e) {
      if (e instanceof QueryFailedError) {
        return res.status(500).json({
          message: 'user already exist',
        });
      }

      switch (e.message) {
        case 'signature verification failed':
          return res.status(401).json({
            message: 'signature verification faild',
          });

        default:
          return res.status(500).json({
            message: 'internal server error',
          });
      }
    }
  }

  @Post('/signin')
  async signin(@Request() req, @Res() res: Response) {
    if (!req.body.message) {
      return res
        .status(422)
        .json({ message: 'Expected prepareMessage object as body.' });
    }

    if (!req.body.signature) {
      return res.status(422).json({ message: 'Expected signature as body.' });
    }

    if (!req.body.eoaAddress) {
      return res.status(422).json({ message: 'Missing required information.' });
    }

    try {
      const parsedMessage = await this.siweService
        .verifyMessage(req.body.message, req.body.signature, req.body.nonce)
        .catch((e) => {
          console.log(e.message);
          throw e;
        });

      if (
        ethers.getAddress(parsedMessage.address) !==
        ethers.getAddress(req.body.eoaAddress)
      ) {
        return res.status(401).json({ message: 'Authentication failed.' });
      }

      const loggedUser = await this.userService.getOneByEOAAddress(
        ethers.getAddress(req.body.eoaAddress),
      );

      if (!loggedUser)
        return res.status(401).json({ message: 'Authentication failed.' });

      const jwtToken = this.jwtService.sign(
        {
          eoaAddress: loggedUser.eoaAddress,
        },
        {
          secret: process.env.JWT_SECRET_KEY,
          expiresIn: '1d',
        },
      );

      res.status(200).json({
        access_token: jwtToken,
      });
    } catch (e) {
      res.status(401).json({
        message: 'signature verification faild',
      });
    }
  }

  @Get('/profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req, @Res() res: Response) {
    const userDto: UserDTO = {
      username: req.user.username,
      eoaAddress: req.user.eoaAddress,
    };

    return res.status(200).json(userDto);
  }
}
