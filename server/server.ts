// server.ts
import express from "express";
import { createServer } from "http";
import { Server as IOServer } from "socket.io";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO on the same server
export const io = new IOServer(server, {
  cors: { origin: "http://localhost:3000" },
  transports: ["websocket"],
});

// Listen for client connections
io.on("connection", async (socket) => {
  console.log("Client connected:", socket.id);

  // Push old notifications to the connected client
  try {
    const oldNotifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 50, // latest 50 notifications
    });

    socket.emit("OLD_NOTIFICATIONS", oldNotifications);
  } catch (err) {
    console.error("Error fetching old notifications:", err);
  }

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Broadcast route for new notifications
app.post("/broadcast", (req, res) => {
  const notification = req.body;
  io.emit("NEW_NOTIFICATION", notification); // send to all connected clients
  res.status(200).json({ ok: true });
});

// Start server
server.listen(4000, () => {
  console.log("Server + Socket.IO running on http://localhost:4000");
});
