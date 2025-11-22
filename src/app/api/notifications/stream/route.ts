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
    async start(controller) {
      console.log("[SSE] Stream started");

      // Send initial connection event
      controller.enqueue(encoder.encode(`event: connected\ndata: ok\n\n`));

      // 1️⃣ Send existing notifications (up to 50)
      try {
        const allNotifications = await prisma.notification.findMany({
          orderBy: { createdAt: "asc" },
          take: 50,
        });

        if (allNotifications.length > 0) {
          lastCheck = allNotifications[allNotifications.length - 1].createdAt;
          console.log("[SSE] Sending existing notifications:", allNotifications.length);

          controller.enqueue(
            encoder.encode(`event: initial\ndata: ${JSON.stringify(allNotifications)}\n\n`)
          );
        }
      } catch (err) {
        console.error("[SSE] Error fetching initial notifications:", err);
      }

      // 2️⃣ Heartbeat every 15s
      heartbeatInterval = setInterval(() => {
        console.log("[SSE] Sending heartbeat");
        controller.enqueue(encoder.encode(`data: {}\n\n`));
      }, 15000);

      // 3️⃣ Poll database every 3s for new notifications
      notificationInterval = setInterval(async () => {
        try {
          console.log("[SSE] Checking for new notifications since", lastCheck);

          const newNotifications = await prisma.notification.findMany({
            where: { createdAt: { gt: lastCheck } },
            orderBy: { createdAt: "asc" },
          });

          if (newNotifications.length > 0) {
            lastCheck = newNotifications[newNotifications.length - 1].createdAt;
            console.log("[SSE] Found new notifications:", newNotifications.length);

            controller.enqueue(
              encoder.encode(`event: new\ndata: ${JSON.stringify(newNotifications)}\n\n`)
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
