import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { UserController } from './user.controller';
import { UserService } from './services/user.service';
import { JwtService } from './services/jwt.service';
import { HttpModule } from '@nestjs/axios';
import { MailService } from './services/mail.service';
import { OAuth2Service } from './services/oauth2.service';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    PrismaService,
    JwtService,
    MailService,
    OAuth2Service,
  ],
  imports: [ConfigModule, HttpModule],
  exports: [JwtService],
})
export class UserModule {}
