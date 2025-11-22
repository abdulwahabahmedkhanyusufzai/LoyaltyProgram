// src/app/api/notifications/stream/route.ts
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs"; // SSE requires Node runtime

export async function GET() {
  const encoder = new TextEncoder();

  let lastCheck = new Date(0); // start from the beginning
  let notificationInterval: ReturnType<typeof setInterval>;
  let heartbeatInterval: ReturnType<typeof setInterval>;

  console.log("[SSE] New client connected");

  const stream = new ReadableStream({
    start(controller) {
      console.log("[SSE] Stream started");

      // Send initial connection event
      controller.enqueue(encoder.encode(`event: connected\ndata: ok\n\n`));

      // Heartbeat every 15s
      heartbeatInterval = setInterval(() => {
        console.log("[SSE] Sending heartbeat");
        controller.enqueue(encoder.encode(`data: {}\n\n`));
      }, 15000);

      // Poll database every 3s
      notificationInterval = setInterval(async () => {
        try {
          console.log("[SSE] Checking for new notifications since", lastCheck);

          const newNotifications = await prisma.notification.findMany({
            where: { createdAt: { gt: lastCheck } },
            orderBy: { createdAt: "asc" },
          });

          if (newNotifications.length > 0) {
            console.log("[SSE] Found new notifications:", newNotifications.length);
            lastCheck = newNotifications[newNotifications.length - 1].createdAt;

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(newNotifications)}\n\n`)
            );
          } else {
            console.log("[SSE] No new notifications");
          }
        } catch (err) {
          console.error("[SSE] Error fetching notifications:", err);
        }
      }, 3000);
    },

    cancel() {
      console.log("[SSE] Client disconnected, clearing intervals");
      clearInterval(notificationInterval);
      clearInterval(heartbeatInterval);
    },
  });

  // Catch client aborts
  const response = new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });

  console.log("[SSE] Response prepared, sending to client");

  return response;
}
