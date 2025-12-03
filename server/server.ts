// server.ts
import express from "express";
import { createServer } from "http";
import { Server as IOServer, Socket } from "socket.io";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// Startup banner
console.log("---------------------------------------------------");
console.log("SERVER STARTING - " + new Date().toISOString());
console.log("---------------------------------------------------");

// Timestamp logger
function log(step: string, data?: any) {
  const time = new Date().toISOString();
  console.log(`\n[${time}] 🔹 ${step}`);
  if (data !== undefined) console.log("Data:", data);
}

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
export const io = new IOServer(server, {
  cors: { origin: "https://waro.d.codetors.dev" },
  transports: ["websocket"],
  path: "/socket.io",
});

// Handle client connections
io.on("connection", async (socket: Socket) => {
  log("Client connected", { socketId: socket.id });

  // Push old notifications
  try {
    const oldNotifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    log("Sending OLD_NOTIFICATIONS to client", { socketId: socket.id, count: oldNotifications.length });
    socket.emit("OLD_NOTIFICATIONS", oldNotifications);
  } catch (err) {
    log("Error fetching old notifications", err);
  }

  // HEALTH CHECK EVENT
  socket.on("ping_test", (msg) => {
    log("Received ping_test from client", { socketId: socket.id, msg });
    socket.emit("pong_test", { message: "pong", received: msg });
  });

  // Mark all as read
  socket.on("MARK_ALL_READ", async () => {
    log("Received MARK_ALL_READ from client", { socketId: socket.id });
    try {
      await prisma.notification.updateMany({
        where: { read: false },
        data: { read: true },
      });
      log("Marked all notifications as read in DB");
      // Broadcast to all clients (including sender) to ensure sync
      io.emit("ALL_NOTIFICATIONS_READ");
    } catch (err) {
      log("Error marking notifications as read", err);
    }
  });

  // Mark single as read
  socket.on("MARK_READ", async (id: string) => {
    log("Received MARK_READ from client", { socketId: socket.id, id });
    try {
      await prisma.notification.update({
        where: { id },
        data: { read: true },
      });
      log(`Marked notification ${id} as read in DB`);
      // Broadcast to all clients
      io.emit("NOTIFICATION_UPDATED", { id, read: true });
    } catch (err) {
      log("Error marking notification as read", err);
    }
  });

  // Handle disconnect
  socket.on("disconnect", (reason) => {
    log("Client disconnected", { socketId: socket.id, reason });
  });

  // Handle errors
  socket.on("error", (err) => {
    log("Socket error", { socketId: socket.id, error: err });
  });
});

// HTTP route to broadcast notifications
app.post("/broadcast", (req, res) => {
  const notification = req.body;

  log("Broadcasting NEW_NOTIFICATION", notification);

  io.emit("NEW_NOTIFICATION", notification);

  res.status(200).json({ ok: true });
});

// Start server
server.listen(3001, () => {
  log("Server + Socket.IO running", {
    url: "http://localhost:3001",
    path: "/socket.io",
  });
});
