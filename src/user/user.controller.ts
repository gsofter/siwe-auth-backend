import { Controller, Get, Post, Request, Logger, Res } from '@nestjs/common';
import { Response } from 'express';

// ** import internal dependencies
import { UserService } from './user.service';
import { SiweService } from 'src/siwe/siwe.service';
import { UserDTO } from './user.dto';
import { ethers } from 'ethers';

@Controller('user')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private readonly userService: UserService,
    private readonly siweService: SiweService,
  ) {}
  @Get('/nonce')
  async getNonce(@Request() req, @Res() res) {
    const nonce = this.siweService.getSiweNonce();
    this.logger.verbose('nonce', nonce);

    res.status(200).json({ nonce });
  }

  @Get('/profile')
  async getProfile() {
    return;
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
        eoaAddress: req.body.eoaAddress,
      };

      const newUser = await this.userService.insertOne(newUserDto).catch(() => {
        throw new Error('internal server error');
      });

      res.status(201).json({
        userId: newUser.id,
      });
    } catch (e) {
      switch (e.message) {
        case 'signature verification failed':
          return res.status(401).json({
            message: 'signature verification faild',
          });

        case 'internal server error':
          return res.status(500).json({
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

    if (!req.body.username || !req.body.eoaAddress) {
      return res.status(400).json({ message: 'Missing required information.' });
    }

    try {
      const parsedMessage = await this.siweService.verifyMessage(
        req.body.message,
        req.body.signature,
        req.session.nonce,
      );

      if (
        ethers.getAddress(parsedMessage.address) !==
        ethers.getAddress(req.body.eoaAddress)
      ) {
        return res.status(401).json({ message: 'Authentication failed.' });
      }

      // TODO: generate jwt auth token

      res.status(200).json({
        message: 'login success',
      });
    } catch (e) {
      res.status(401).json({
        message: 'signature verification faild',
      });
    }
  }
}
