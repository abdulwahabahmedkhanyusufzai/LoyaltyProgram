import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { prisma } from "../src/lib/prisma";

let io: SocketIOServer | null = null;

export function startSocketServer(httpServer?: any) {
  if (io) {
    console.log("[IO] Socket.IO server already running");
    return io;
  }

  if (httpServer) {
    // Attach to existing HTTP server
    io = new SocketIOServer(httpServer, {
      path: "/ws",
      cors: {
        origin: "*", // adjust for your frontend domain
        methods: ["GET", "POST"],
      },
    });
    console.log("[IO] Socket.IO attached to HTTP server");
  } else {
    // Standalone server
    const server = createServer();
    io = new SocketIOServer(server, {
      path: "/ws",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
    server.listen(3001, () =>
      console.log("[IO] Standalone Socket.IO server running on http://localhost:3001")
    );
  }

  io.on("connection", async (socket) => {
    console.log("[IO] Client connected. Socket ID:", socket.id);

    try {
      const notifications = await prisma.notification.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      socket.emit("initial", notifications);
    } catch (err) {
      console.error("[IO] Failed to fetch notifications:", err);
    }

    socket.on("disconnect", () => {
      console.log("[IO] Client disconnected. Socket ID:", socket.id);
    });

    socket.on("client-message", (msg) => {
      console.log("[IO] Message from client:", msg);
    });
  });

  return io;
}

// Broadcast helper
export function broadcastNotification(notification: any) {
  if (!io) return;
  io.emit("new", [notification]);
}

// Standalone run
if (require.main === module) {
  startSocketServer();
}
