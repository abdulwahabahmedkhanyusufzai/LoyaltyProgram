// server.ts
import express from "express";
import { createServer } from "http";
import { Server as IOServer, Socket } from "socket.io";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// Utility: timestamped log
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

// Listen for client connections
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

  // Listen for custom events if needed
  socket.on("ping_test", (msg) => {
    log("Received ping_test from client", { socketId: socket.id, msg });
    socket.emit("pong_test", { message: "pong", received: msg });
  });

  // Handle disconnect
  socket.on("disconnect", (reason) => {
    log("Client disconnected", { socketId: socket.id, reason });
  });

  // Handle any unexpected error
  socket.on("error", (err) => {
    log("Socket error", { socketId: socket.id, error: err });
  });
});

// Broadcast route for new notifications
app.post("/broadcast", (req, res) => {
  const notification = req.body;
  log("Broadcasting NEW_NOTIFICATION", notification);
  io.emit("NEW_NOTIFICATION", notification);
  res.status(200).json({ ok: true });
});

import { runBackfill } from "./backfill-notifications";

// Start server
server.listen(3001, () => {
  log("Server + Socket.IO running", { url: "http://localhost:3001", path: "/socket.io" });
  
  // Run backfill on startup
  runBackfill().catch(err => log("Backfill failed", err));
});

// Catch unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  log("Unhandled Rejection", { reason, promise });
});

// Catch uncaught exceptions
process.on("uncaughtException", (err) => {
  log("Uncaught Exception", err);
});
