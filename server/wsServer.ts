import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { prisma } from "../src/lib/prisma";

// ===============================================================
//                        GLOBAL DEBUG HELPERS
// ===============================================================
let io: SocketIOServer | null = null;
let stepCount = 0;
const bootTime = Date.now();

function step(label: string, data: any = undefined) {
  stepCount++;
  const elapsed = `${Date.now() - bootTime}ms`;
  console.log(`\n🔎 [WS:STEP ${stepCount}] ${label} (+${elapsed})`);
  if (data !== undefined) {
    try {
      console.log("📦", JSON.stringify(data, null, 2));
    } catch {
      console.log("📦 (RAW)", data);
    }
  }
}

function slowLog(start: number, label: string) {
  const duration = Date.now() - start;
  if (duration > 150) {
    console.warn(`🐌 [SLOW ${duration}ms] ${label}`);
  }
}

// ===============================================================
//                        SOCKET SERVER START
// ===============================================================
export function startSocketServer(httpServer?: any) {
  step("Starting Socket Server");

  if (io) {
    step("Socket.IO already running — skipping creation");
    return io;
  }

  if (httpServer) {
    step("Attaching Socket.IO to existing HTTP server");

    io = new SocketIOServer(httpServer, {
      path: "/ws",
      cors: { origin: "*", methods: ["GET", "POST"] },
    });

    step("Socket.IO attached to existing HTTP server");
  } else {
    step("Starting standalone Socket.IO server");

    const server = createServer();
    io = new SocketIOServer(server, {
      path: "/ws",
      cors: { origin: "*", methods: ["GET", "POST"] },
    });

    server.listen(3001, () =>
      step("Standalone Socket.IO server running on port 3001")
    );
  }

  // ===============================================================
  //                          CONNECTION HANDLER
  // ===============================================================
  io.on("connection", async (socket) => {
    step("Client Connected", { socketId: socket.id });

    // ---------------------------
    // Load Notifications
    // ---------------------------
    const dbStart = Date.now();
    try {
      step("Fetching last 50 notifications from DB");

      const notifications = await prisma.notification.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      slowLog(dbStart, "DB: Fetch notifications");

      step("Sending initial notifications to client", {
        count: notifications.length,
      });

      socket.emit("initial", notifications);
    } catch (err: any) {
      const fingerprint = crypto.randomUUID();
      console.error(`❌ [WS_ERROR ${fingerprint}] Failed to fetch notifications`);
      console.error(err);
    }

    // ---------------------------
    // Client disconnect
    // ---------------------------
    socket.on("disconnect", () => {
      step("Client Disconnected", { socketId: socket.id });
    });

    // ---------------------------
    // Client → Server messages
    // ---------------------------
    socket.on("client-message", (msg) => {
      step("Received client-message event", { socketId: socket.id, msg });
    });
  });

  return io;
}

// ===============================================================
//                      BROADCAST NOTIFICATION
// ===============================================================
export function broadcastNotification(notification: any) {
  step("Broadcasting Notification", notification);

  if (!io) {
    console.warn("⚠️ broadcastNotification called but io is NULL");
    return;
  }

  try {
    io.emit("new", [notification]);
    step("Notification broadcast successfully");
  } catch (err) {
    const fingerprint = crypto.randomUUID();
    console.error(`❌ [WS_BROADCAST_ERR ${fingerprint}]`, err);
  }
}

// ===============================================================
//  Standalone run (node wsServer.js)
// ===============================================================
if (require.main === module) {
  step("Running WS server standalone mode");
  startSocketServer();
}
