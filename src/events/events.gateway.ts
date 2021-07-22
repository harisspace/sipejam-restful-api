import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { SpeedData, VehicleData } from 'src/interface/event.interface';
import { PrismaService } from 'src/prisma.service';
import * as WebSocket from 'ws';
import { IotTokenGuard } from './guards/iot-token.guard';
import { EventsService } from './services/events.service';
import { v4 as uuidV4 } from 'uuid';
import { DataTypeRoles } from './decorators/data-type.decorator';
import { DataTypeGuard } from './guards/data.guard';

@WebSocketGateway()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private rooms = {};
  private leave: (roomUid: string) => void;
  private uuid: string;
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
  ) {}

  @WebSocketServer()
  server: WebSocket.Server;

  handleConnection(client: any) {
    client.client_uid = uuidV4();

    this.leave = (roomUid: string) => {
      if (!this.rooms[roomUid][client.client_uid]) return;

      // leave room
      console.log('leave room', client.client_uid);

      delete this.rooms[roomUid][client.client_uid];
    };
  }

  handleDisconnect() {
    for (const roomUid of Object.keys(this.rooms)) {
      this.leave(roomUid);
    }
  }

  @UseGuards(IotTokenGuard)
  @SubscribeMessage('web_client')
  async onEventJoin(@MessageBody() data: any, @ConnectedSocket() socket: any) {
    const { meta } = data;
    const { system_uid, client_uid } = socket;

    if (meta === 'join') {
      if (!this.rooms[system_uid]) this.rooms[system_uid] = {};
      if (!this.rooms[system_uid][client_uid]) {
        this.rooms[system_uid][client_uid] = socket;
      }
    } else if (meta === 'leave') {
      this.leave(system_uid);
    }
  }

  @DataTypeRoles('speed')
  @UseGuards(IotTokenGuard, DataTypeGuard)
  @SubscribeMessage('speed_1')
  async onEventSpeed1(
    @MessageBody() data: SpeedData,
    @ConnectedSocket() socket: any,
  ) {
    const { system_uid } = socket;

    // save to db
    await this.eventsService.createSpeed1(data);

    // send to esp32 or jetson nano
    socket.send(JSON.stringify({ data, event: 'speed_1' }));

    // broadcast to room when client web already exist
    if (this.rooms[system_uid]) {
      for (const [_, value] of Object.entries(this.rooms[system_uid])) {
        if ((value as WebSocket).readyState === WebSocket.OPEN) {
          (value as WebSocket).send(JSON.stringify({ data, event: 'speed_1' }));
        }
      }
    }
  }

  @DataTypeRoles('speed')
  @UseGuards(IotTokenGuard, DataTypeGuard)
  @SubscribeMessage('speed_2')
  async onEventSpeed2(
    @MessageBody() data: SpeedData,
    @ConnectedSocket() socket: any,
  ) {
    const { system_uid } = socket;

    // save to db
    this.eventsService.createSpeed2(data);

    // send to esp32 or jetson nano
    socket.send(JSON.stringify({ data, event: 'speed_2' }));

    // broadcast to room when client web already exist
    if (this.rooms[system_uid]) {
      for (const [_, value] of Object.entries(this.rooms[system_uid])) {
        if ((value as WebSocket).readyState === WebSocket.OPEN) {
          (value as WebSocket).send(JSON.stringify({ data, event: 'speed_2' }));
        }
      }
    }
  }

  @DataTypeRoles('vehicle')
  @UseGuards(IotTokenGuard, DataTypeGuard)
  @SubscribeMessage('vehicle_1')
  async onEventVehicle1(
    @MessageBody() data: VehicleData,
    @ConnectedSocket() socket: any,
  ) {
    const { system_uid } = socket;

    // save to db
    this.eventsService.createVehicle1(data);

    // send to esp32 or jetson nano
    socket.send(JSON.stringify({ data, event: 'vehicle_1' }));

    // broadcast to room when client web already exist
    if (this.rooms[system_uid]) {
      for (const [_, value] of Object.entries(this.rooms[system_uid])) {
        if ((value as WebSocket).readyState === WebSocket.OPEN) {
          (value as WebSocket).send(
            JSON.stringify({ data, event: 'vehicle_1' }),
          );
        }
      }
    }
  }

  @DataTypeRoles('vehicle')
  @UseGuards(IotTokenGuard, DataTypeGuard)
  @SubscribeMessage('vehicle_2')
  async onEventVehicle2(
    @MessageBody() data: VehicleData,
    @ConnectedSocket() socket: any,
  ) {
    const { system_uid } = socket;

    // save to db
    this.eventsService.createVehicle2(data);

    // send to esp32 or jetson nano
    socket.send(JSON.stringify({ data, event: 'vehicle_2' }));

    // broadcast to room when client web already exist
    if (this.rooms[system_uid]) {
      for (const [_, value] of Object.entries(this.rooms[system_uid])) {
        if ((value as WebSocket).readyState === WebSocket.OPEN) {
          (value as WebSocket).send(
            JSON.stringify({ data, event: 'vehicle_2' }),
          );
        }
      }
    }
  }
}
