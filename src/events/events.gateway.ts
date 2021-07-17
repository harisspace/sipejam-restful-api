// import { Inject } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import * as WebSocket from 'ws';

@WebSocketGateway()
export class EventsGateway {
  @WebSocketServer()
  server: WebSocket.Server;

  @SubscribeMessage('speed')
  onEventSpeed(@MessageBody() data: any, @ConnectedSocket() socket: any) {
    console.log(data);
    this.server.clients.forEach((client: any) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ data, event: 'speed' }));
      }
    });
  }

  @SubscribeMessage('vehicle')
  onEventVehicle(@MessageBody() data: any, @ConnectedSocket() socket: any) {
    console.log(data);
    this.server.clients.forEach((client: any) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ data, event: 'vehicle' }));
      }
    });
  }
}
