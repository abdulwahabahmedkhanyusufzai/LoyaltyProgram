import { WebSocketServer } from "ws";
import { prisma } from "../../lib/prisma";

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

export function startWebSocketServer(server?: any) {
  if (wss) return wss;

  if (server) {
    wss = new WebSocketServer({ noServer: true });
    server.on("upgrade", (req, socket, head) => {
      wss!.handleUpgrade(req, socket, head, (ws) => {
        wss!.emit("connection", ws, req);
      });
    });
    console.log("[WS] WebSocket attached to HTTP server");
  } else {
    wss = new WebSocketServer({ port: 3001 });
    console.log("[WS] Standalone WebSocket server running on ws://localhost:3001");
  }

  wss.on("connection", async (ws) => {
    clients.add(ws);
    console.log("[WS] Client connected");

    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    ws.send(JSON.stringify({ type: "initial", notifications }));

    ws.on("close", () => {
      clients.delete(ws);
      console.log("[WS] Client disconnected");
    });
  });

  return wss;
}

export function broadcastNotification(notification: any) {
  const msg = JSON.stringify({ type: "new", notifications: [notification] });
  clients.forEach((client) => {
    if (client.readyState === client.OPEN) client.send(msg);
  });
}

// Standalone run
if (require.main === module) {
  startWebSocketServer();
}
