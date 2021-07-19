// import { Inject } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { SpeedData, VehicleData } from 'src/interface/event.interface';
import { PrismaService } from 'src/prisma.service';
import * as WebSocket from 'ws';

@WebSocketGateway()
export class EventsGateway {
  constructor(private readonly prisma: PrismaService) {}

  @WebSocketServer()
  server: WebSocket.Server;

  @SubscribeMessage('speed_1')
  async onEventSpeed1(
    @MessageBody() data: SpeedData,
    @ConnectedSocket() socket: any,
  ) {
    const { iot_token, speed } = data;
    await this.prisma.speeds1.create({
      data: { iot_token, speed },
    });
    this.server.clients.forEach((client: any) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ data, event: 'speed_1' }));
      }
    });
  }

  @SubscribeMessage('speed_2')
  async onEventSpeed2(
    @MessageBody() data: SpeedData,
    @ConnectedSocket() socket: any,
  ) {
    const { iot_token, speed } = data;

    await this.prisma.speeds2.create({
      data: { iot_token, speed },
    });

    this.server.clients.forEach((client: any) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ speed, event: 'speed_2' }));
      }
    });
  }

  @SubscribeMessage('vehicle_1')
  async onEventVehicle1(
    @MessageBody() data: VehicleData,
    @ConnectedSocket() socket: any,
  ) {
    const { vehicle, iot_token } = data;

    await this.prisma.vehicles1.create({
      data: { iot_token, vehicle },
    });

    this.server.clients.forEach((client: any) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ vehicle, event: 'vehicle_1' }));
      }
    });
  }

  @SubscribeMessage('vehicle_2')
  async onEventVehicle2(
    @MessageBody() data: VehicleData,
    @ConnectedSocket() socket: any,
  ) {
    const { vehicle, iot_token } = data;

    await this.prisma.vehicles2.create({
      data: { iot_token, vehicle },
    });

    this.server.clients.forEach((client: any) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ vehicle, event: 'vehicle_2' }));
      }
    });
  }
}
