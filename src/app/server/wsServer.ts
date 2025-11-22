import { WebSocketServer, WebSocket } from "ws";
import { prisma } from "../../lib/prisma";

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

// --- Heartbeat to keep connections alive ---
function heartbeat(ws: WebSocket) {
  ws.isAlive = true;
  ws.on("pong", () => {
    ws.isAlive = true;
  });
}

// --- Start WS server (standalone or attachable) ---
export function startWebSocketServer(server?: any) {
  if (wss) {
    console.log("[WS] Server already running");
    return wss;
  }

  if (server) {
    // Attach to existing HTTP server
    wss = new WebSocketServer({ noServer: true });
    server.on("upgrade", (req, socket, head) => {
      wss!.handleUpgrade(req, socket, head, (ws) => {
        wss!.emit("connection", ws, req);
      });
    });
    console.log("[WS] WebSocket attached to HTTP server");
  } else {
    // Standalone server
    wss = new WebSocketServer({ port: 3001 });
    console.log("[WS] Standalone WebSocket server running on ws://localhost:3001");
  }

  // --- Connection handler ---
  wss.on("connection", async (ws) => {
    clients.add(ws);
    ws.isAlive = true;
    heartbeat(ws);

    console.log("[WS] Client connected. Total clients:", clients.size);

    // Send last 50 notifications
    try {
      const notifications = await prisma.notification.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      ws.send(JSON.stringify({ type: "initial", notifications }));
    } catch (err) {
      console.error("[WS] Failed to fetch notifications:", err);
    }

    ws.on("message", (msg) => {
      console.log("[WS] Message from client:", msg.toString());
    });

    ws.on("close", () => {
      clients.delete(ws);
      console.log("[WS] Client disconnected. Remaining clients:", clients.size);
    });

    ws.on("error", (err) => console.error("[WS] Client error:", err));
  });

  // --- Heartbeat interval ---
  const interval = setInterval(() => {
    clients.forEach((ws) => {
      if (!ws.isAlive) {
        console.log("[WS] Terminating dead client");
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => clearInterval(interval));
  wss.on("error", (err) => console.error("[WS] Server error:", err));

  return wss;
}

// --- Broadcast helper ---
export function broadcastNotification(notification: any) {
  const msg = JSON.stringify({ type: "new", notifications: [notification] });
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(msg);
      } catch (err) {
        console.error("[WS] Broadcast failed:", err);
      }
    }
  });
}

// --- Standalone run (ES module compatible) ---
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  startWebSocketServer();
}
