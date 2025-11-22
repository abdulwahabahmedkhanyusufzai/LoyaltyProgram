import { startSocketServer } from "../../server/wsServer";

let wsServerStarted = false; // Prevent double-start

export const GET = async (req: Request) => {
  const startTime = Date.now();

  try {
    console.log("🟦 [WS INIT] Incoming request to initialize WebSocket server");
    console.log("🟦 [WS INIT] PID:", process.pid, "Timestamp:", new Date().toISOString());

    const socketServer = (req as any).socket?.server;

    if (!socketServer) {
      console.error("❌ [WS INIT] No socket server found on request object");
      return new Response("Missing socket server", { status: 500 });
    }

    console.log("🟩 [WS INIT] Socket server detected");

    // Prevent duplicate servers
    if (wsServerStarted) {
      console.warn("⚠️ [WS INIT] WebSocket server already started — skipping re-init");
      return new Response("WebSocket server already running", { status: 200 });
    }

    console.log("🟦 [WS INIT] Starting WebSocket server…");

    // Try to start server
    await startSocketServer(socketServer);

    wsServerStarted = true;

    const duration = Date.now() - startTime;
    console.log(`🟩 [WS INIT] WebSocket server started successfully in ${duration}ms`);
    console.log("🟩 [WS INIT] Server running on ws://localhost:3001");
    console.log("🟢 [WS INIT] Ready for connections\n");

    return new Response("WebSocket server initialized", { status: 200 });

  } catch (err: any) {
    console.error("❌ [WS INIT] Failed to initialize WebSocket server");
    console.error("❌ [WS ERROR]", err?.message || err);
    console.error(err?.stack || "No stacktrace available");

    return new Response("WS init failed: " + (err?.message || "Unknown error"), {
      status: 500,
    });
  }
};
