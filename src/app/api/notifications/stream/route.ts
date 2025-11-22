import { prisma } from "@/lib/prisma";

export async function GET() {
  const encoder = new TextEncoder();

  let notificationInterval: ReturnType<typeof setInterval>;
  let heartbeatInterval: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    async start(controller) {
      let lastCheck = new Date(0); // fetch from the beginning

      // Heartbeat every 15s to keep connection alive
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

      // Initial message
      controller.enqueue(encoder.encode(`event: connected\ndata: ok\n\n`));
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
