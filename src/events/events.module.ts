import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventsGateway],
  imports: [ConfigService],
})
export class EventsModule {}
