import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserDTO } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async getAll(): Promise<User[]> {
    return this.userRepo.find();
  }

  async insertOne(user: UserDTO): Promise<User> {
    const newUser = this.userRepo.create(user);
    await this.userRepo.save(newUser);
    return newUser;
  }

  async getOneByEOAAddress(eoaAddress: string): Promise<User> {
    return this.userRepo.findOneOrFail({ where: { eoaAddress } });
  }
}
