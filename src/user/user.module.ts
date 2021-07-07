import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';
import { UserController } from './user.controller';
import { UserService } from './services/user.service';
import { JwtService } from './services/jwt.service';
import { EmailService } from './services/email.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, JwtService, EmailService],
  imports: [ConfigModule],
  exports: [JwtService],
})
export class UserModule {}
