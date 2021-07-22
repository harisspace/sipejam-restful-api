/* eslint-disable @typescript-eslint/ban-types */
import * as WebSocket from 'ws';
import { WebSocketAdapter, INestApplicationContext } from '@nestjs/common';
import { MessageMappingProperties } from '@nestjs/websockets';
import { Observable, fromEvent, EMPTY } from 'rxjs';
import { mergeMap, filter } from 'rxjs/operators';
import { Server } from 'ws';
import { Socket } from 'net';

export class WsAdapter implements WebSocketAdapter {
  constructor(private app: INestApplicationContext) {}

  create(port: number, options: any = {}): any {
    return new WebSocket.Server({ port, ...options });
  }

  bindClientConnect(server, callback: Function) {
    // console.log(callback);
    server.on('connection', callback);

    // server.on(
    //   'upgrade',
    //   function upgrade(request: any, socket: Socket, head: any) {
    //     console.log(request, socket, head);

    //     server.handleUpgrade(
    //       request,
    //       socket,
    //       head,
    //       function done(ws: WebSocket) {
    //         server.emit('connection', ws, request);
    //       },
    //     );
    //   },
    // );
  }

  // bindClientDisconnect(server, callback: Function) {
  //   server.on('disconnect', callback);
  // }

  bindMessageHandlers(
    client: WebSocket,
    handlers: MessageMappingProperties[],
    process: (data: any) => Observable<any>,
  ) {
    fromEvent(client, 'message')
      .pipe(
        mergeMap((data) => this.bindMessageHandler(data, handlers, process)),
        filter((result) => result),
      )
      .subscribe((response) => client.send(JSON.stringify(response)));
  }

  bindMessageHandler(
    buffer,
    handlers: MessageMappingProperties[],
    process: (data: any) => Observable<any>,
  ): Observable<any> {
    const message = JSON.parse(buffer.data);
    const messageHandler = handlers.find(
      (handler) => handler.message === message.event,
    );
    if (!messageHandler) {
      return EMPTY;
    }
    return process(messageHandler.callback(message.data));
  }

  close(server) {
    server.close();
  }
}
