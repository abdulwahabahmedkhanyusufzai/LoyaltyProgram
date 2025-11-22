// /app/api/notifications/stream/route.ts
export const dynamic = "force-dynamic"; // important for live SSE

import { prisma } from "@/lib/prisma";

// SSE Route: Streams real-time notifications
export async function GET() {
  const encoder = new TextEncoder();

  return new Response(
    new ReadableStream({
      async start(controller) {
        let lastCheck = new Date();

        // Send initial connection confirmation
        controller.enqueue(encoder.encode("event: connected\ndata: ok\n\n"));

        // Interval to check for new notifications
        const interval = setInterval(async () => {
          try {
            const newNotifications = await prisma.notification.findMany({
              where: { createdAt: { gt: lastCheck } },
              orderBy: { createdAt: "desc" },
            });

            if (newNotifications.length > 0) {
              lastCheck = new Date();

              // Send new notifications to client
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(newNotifications)}\n\n`)
              );
            } else {
              // Heartbeat to keep the connection alive
              controller.enqueue(encoder.encode(`data: heartbeat\n\n`));
            }
          } catch (err) {
            console.error("SSE error fetching notifications:", err);
          }
        }, 1500); // every 1.5s

        // Cleanup on client disconnect
        return () => clearInterval(interval);
      },
    }),
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    }
  );
}
