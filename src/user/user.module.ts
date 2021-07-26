import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';
import { UserController } from './user.controller';
import { UserService } from './services/user.service';
import { JwtService } from './services/jwt.service';
import { EmailService } from './services/email.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, JwtService, EmailService],
  imports: [ConfigModule, HttpModule],
  exports: [JwtService],
})
export class UserModule {}
