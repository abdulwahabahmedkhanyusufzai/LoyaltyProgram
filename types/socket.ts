import type { NextApiResponse } from "next";
import type { Socket } from "net";
import type { Server as HTTPServer } from "http";
import type { Server as IOServer } from "socket.io";

export interface SocketServer extends HTTPServer {
  io?: IOServer;
}

export interface SocketWithIO extends Socket {
  server: SocketServer;
}

export interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}
export enum WebsocketEventEnum {
  MY_EVENT_NAME = "MY_EVENT_NAME",
  ANOTHER_EVENT = "ANOTHER_EVENT",
}

