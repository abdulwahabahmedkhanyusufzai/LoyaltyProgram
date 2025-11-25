// start-socket.js
import crypto from "crypto";
import cors from "cors";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { prisma } from "../src/lib/prisma";

// ======= Debug Helpers =======
let io: SocketIOServer | null = null;
let stepCount = 0;
const bootTime = Date.now();
function step(label: string, data: any = undefined) {
  stepCount++;
  const elapsed = `${Date.now() - bootTime}ms`;
  console.log(`\n🔎 [WS:STEP ${stepCount}] ${label} (+${elapsed})`);
  if (data !== undefined) {
    try { console.log("📦", JSON.stringify(data, null, 2)); }
    catch { console.log("📦 (RAW)", data); }
  }
}
function slowLog(start: number, label: string) {
  const duration = Date.now() - start;
  if (duration > 150) console.warn(`🐌 [SLOW ${duration}ms] ${label}`);
}

// ======= Express + HTTP server =======
const app = express();
app.use(cors()); // permit browser socket handshake; tighten origin in production
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.WS_PORT ? Number(process.env.WS_PORT) : 3001;
const BROADCAST_SECRET = process.env.BROADCAST_SECRET || "change-me-in-prod";

// POST /broadcast  <-- called by your webhook
app.post("/broadcast", (req, res) => {
  const auth = req.header("x-broadcast-secret");
  if (!auth || auth !== BROADCAST_SECRET) {
    step("Rejected /broadcast: invalid secret", { ip: req.ip });
    return res.status(401).json({ ok: false, message: "unauthorized" });
  }

  const notification = req.body;
  step("External broadcast received", { notification });

  if (!io) {
    step("Broadcast failed: io is null");
    return res.status(500).json({ ok: false, message: "socket server not ready" });
  }

  try {
    io.emit("new", [notification]);
    step("Notification broadcast to clients", { emittedTo: "all" });
    return res.json({ ok: true });
  } catch (err: any) {
    const fingerprint = crypto.randomUUID();
    console.error(`❌ [WS_BROADCAST_ERR ${fingerprint}]`, err);
    return res.status(500).json({ ok: false, fingerprint });
  }
});

// create http server and attach socket.io
const server = createServer(app);

export function startSocketServer(httpServer?: any) {
  step("Starting Socket Server");
  if (io) {
    step("Socket.IO already running — skipping creation");
    return io;
  }

  const attachServer = httpServer || server;
  io = new SocketIOServer(attachServer, {
    path: "/ws",
    cors: { origin: "*", methods: ["GET", "POST"] }, // tighten origin for prod
  });

  // connection handler
  io.on("connection", async (socket) => {
    step("Client Connected", { socketId: socket.id });

    const dbStart = Date.now();
    try {
      const notifications = await prisma.notification.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      slowLog(dbStart, "DB: Fetch notifications");
      step("Sending initial notifications to client", { count: notifications.length });
      socket.emit("initial", notifications);
    } catch (err: any) {
      const fingerprint = crypto.randomUUID();
      console.error(`❌ [WS_ERROR ${fingerprint}] Failed to fetch notifications`, err);
    }

    socket.on("disconnect", () => step("Client Disconnected", { socketId: socket.id }));
    socket.on("client-message", (msg) => step("Received client-message event", { socketId: socket.id, msg }));
  });

  if (!httpServer) {
    server.listen(PORT, () => step(`Standalone Socket.IO server running on http://localhost:${PORT}`));
  } else {
    step("Socket.IO attached to provided httpServer");
  }

  return io;
}

// Optional programmatic broadcast helper you can import if in same process
export function broadcastNotification(notification: any) {
  step("broadcastNotification called", notification);
  if (!io) {
    console.warn("⚠️ broadcastNotification called but io is NULL");
    return false;
  }
  try {
    io.emit("new", [notification]);
    step("Notification broadcast successfully (programmatic)");
    return true;
  } catch (err) {
    const fingerprint = crypto.randomUUID();
    console.error(`❌ [WS_BROADCAST_ERR ${fingerprint}]`, err);
    return false;
  }
}

// standalone run
if (require.main === module) {
  startSocketServer();
}
