// src/app/api/notifications/stream/route.ts
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs"; // important for SSE

export async function GET() {
  const encoder = new TextEncoder();

  let lastCheck = new Date(0); // start from beginning
  let notificationInterval: ReturnType<typeof setInterval>;
  let heartbeatInterval: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial message
      controller.enqueue(encoder.encode(`event: connected\ndata: ok\n\n`));

      // Heartbeat every 15s
      heartbeatInterval = setInterval(() => {
        controller.enqueue(encoder.encode(`data: {}\n\n`));
      }, 15000);

      // Poll database every 3s
      notificationInterval = setInterval(async () => {
        try {
          const newNotifications = await prisma.notification.findMany({
            where: { createdAt: { gt: lastCheck } },
            orderBy: { createdAt: "asc" },
          });

          if (newNotifications.length > 0) {
            lastCheck = newNotifications[newNotifications.length - 1].createdAt;

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(newNotifications)}\n\n`)
            );
          }
        } catch (err) {
          console.error("SSE notification error:", err);
        }
      }, 3000);
    },

    cancel() {
      clearInterval(notificationInterval);
      clearInterval(heartbeatInterval);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
