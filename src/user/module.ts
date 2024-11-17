import { Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { PrismaService } from '../lib/prisma';

@Module({
  providers: [UserService, PrismaService],
  exports: [UserService],
})
export class UserModule {}
