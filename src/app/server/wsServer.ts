import { WebSocketServer } from "ws";
import { prisma } from "../../lib/prisma.ts";

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

// Function to start WS server, attachable to existing HTTP server
export function startWebSocketServer(server?: any) {
  if (wss) return wss; // already started

  if (server) {
    // Attach WS to existing HTTP server
    wss = new WebSocketServer({ noServer: true });
    server.on("upgrade", (req, socket, head) => {
      wss!.handleUpgrade(req, socket, head, (ws) => {
        wss!.emit("connection", ws, req);
      });
    });
    console.log("[WS] WebSocket attached to HTTP server");
  } else {
    // Standalone WS server
    wss = new WebSocketServer({ port: 3001 });
    console.log("[WS] Standalone WebSocket server running on ws://localhost:3001");
  }

  wss.on("connection", async (ws) => {
    clients.add(ws);
    console.log("[WS] Client connected");

    // Send last 50 notifications
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

// Broadcast new notifications
export function broadcastNotification(notification: any) {
  const msg = JSON.stringify({ type: "new", notifications: [notification] });
  clients.forEach((client) => {
    if (client.readyState === client.OPEN) client.send(msg);
  });
}

// If run directly, start standalone server
if (require.main === module) {
  startWebSocketServer();
}
