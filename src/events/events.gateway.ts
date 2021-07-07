// import { Inject } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import WebSocket, { Server } from 'ws';

@WebSocketGateway()
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('speed')
  onEventSpeed(@MessageBody() data: any, @ConnectedSocket() socket: any) {
    console.log(data);
    return { data, event: 'speed' };
  }

  @SubscribeMessage('vehicle')
  onEventVehicle(@MessageBody() data: any, @ConnectedSocket() socket: any) {
    console.log(data);
    this.server.clients.forEach((client: any) => {
      client.send(JSON.stringify({ data, event: 'vehicle' }));
    });
    // socket.emit('vehicle', () => console.log('hello'));
    // return { data, event: 'vehicle' };
    // return false;
  }
}
