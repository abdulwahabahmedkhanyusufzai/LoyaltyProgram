import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const encoder = new TextEncoder();

  let heartbeatInterval: ReturnType<typeof setInterval>;
  let notificationInterval: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection event
      controller.enqueue(encoder.encode(`event: connected\ndata: ok\n\n`));

      // 1️⃣ Send all existing notifications
      try {
        const allNotifications = await prisma.notification.findMany({
          orderBy: { createdAt: "desc" },
          take: 50,
        });
        controller.enqueue(
          encoder.encode(`event: initial\ndata: ${JSON.stringify(allNotifications)}\n\n`)
        );
      } catch (err) {
        console.error("[SSE] Error sending initial notifications:", err);
      }

      // 2️⃣ Heartbeat every 15s
      heartbeatInterval = setInterval(() => {
        controller.enqueue(encoder.encode(`data: {}\n\n`));
      }, 15000);

      // 3️⃣ Poll database for new notifications
      let lastCheck = new Date(); // now
      notificationInterval = setInterval(async () => {
        try {
          const newNotifications = await prisma.notification.findMany({
            where: { createdAt: { gt: lastCheck } },
            orderBy: { createdAt: "asc" },
          });

          if (newNotifications.length > 0) {
            lastCheck = newNotifications[newNotifications.length - 1].createdAt;
            controller.enqueue(
              encoder.encode(`event: new\ndata: ${JSON.stringify(newNotifications)}\n\n`)
            );
          }
        } catch (err) {
          console.error("[SSE] Error fetching new notifications:", err);
        }
      }, 3000);
    },

    cancel() {
      clearInterval(heartbeatInterval);
      clearInterval(notificationInterval);
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
