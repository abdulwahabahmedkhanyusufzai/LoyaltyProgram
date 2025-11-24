import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { prisma } from "../../lib/prisma";

// 1. DEFINE TYPE FOR GLOBAL
declare global {
  var io: SocketIOServer | undefined;
}

export function startSocketServer(httpServer?: any) {
  // If we already have a global instance, return it (Prevent duplicates)
  if (global.io) {
    console.log("[IO] Using existing global Socket.IO instance");
    return global.io;
  }

  let io: SocketIOServer;

  const options = {
    path: "/ws",
    cors: { origin: "*", methods: ["GET", "POST"] },
  };

  if (httpServer) {
    io = new SocketIOServer(httpServer, options);
    console.log("[IO] Attached to existing HTTP server");
  } else {
    const server = createServer();
    io = new SocketIOServer(server, options);
    server.listen(3001, () =>
      console.log("[IO] Standalone server running on :3001")
    );
  }

  // 2. ASSIGN TO GLOBAL
  global.io = io;

  io.on("connection", async (socket) => {
    console.log("[IO] Client connected:", socket.id);
    
    // Send history
    try {
      const notifications = await prisma.notification.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      socket.emit("initial", notifications);
    } catch (e) {
      console.error(e);
    }
  });

  return io;
}

// 3. ROBUST BROADCAST FUNCTION
export function broadcastNotification(notification: any) {
  // Try to grab the global instance
  const io = global.io;

  if (!io) {
    console.error("❌ [IO] Broadcast FAILED. Socket server not found in global scope.");
    return;
  }

  console.log(`✅ [IO] Broadcasting Order #${notification.data?.orderNumber || 'Unknown'}`);
  
  // Emit to everyone
  io.emit("new", [notification]);
}