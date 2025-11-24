// lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    console.log("🌐 Creating socket client...");

    socket = io(typeof window !== "undefined" ? window.location.origin : "", {
      path: "/ws",
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });
  }

  return socket;
}
