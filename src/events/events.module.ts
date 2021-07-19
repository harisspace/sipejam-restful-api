import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventsGateway, PrismaService],
  imports: [ConfigService],
})
export class EventsModule {}
