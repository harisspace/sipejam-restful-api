import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';
import { EventsGateway } from './events.gateway';
import { EventsService } from './services/events.service';

@Module({
  providers: [EventsGateway, PrismaService, EventsService],
  imports: [ConfigService],
})
export class EventsModule {}
