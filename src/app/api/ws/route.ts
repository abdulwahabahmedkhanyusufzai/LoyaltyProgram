import { startWebSocketServer } from "../../server/wsServer";

export const GET = async (req: Request) => {
  const socket = (req as any).socket?.server;

  if (!socket) {
    return new Response("Missing socket server", { status: 500 });
  }

  // Start the WebSocket server (will only start once)
  startWebSocketServer(socket);

  // Return a simple response
  return new Response("WebSocket server initialized", { status: 200 });
};
