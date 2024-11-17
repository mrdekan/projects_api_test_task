import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../../lib/prisma';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async findByUsername(username: string): Promise<User | undefined> {
    return this.prismaService.user.findUnique({ where: { username } });
  }

  async create(username: string, password: string): Promise<User> {
    return this.prismaService.user.create({ data: { password, username } });
  }
}
