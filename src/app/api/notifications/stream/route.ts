import { prisma } from "@/lib/prisma";

export async function GET() {
  const encoder = new TextEncoder();
  let interval: NodeJS.Timer;

  const stream = new ReadableStream({
    async start(controller) {
      let lastCheck = new Date();

      // Heartbeat every 15s
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`data: {}\n\n`));
      }, 15000);

      interval = setInterval(async () => {
        const newNotifications = await prisma.notification.findMany({
          where: { createdAt: { gt: lastCheck } },
          orderBy: { createdAt: "desc" },
        });

        if (newNotifications.length > 0) {
          lastCheck = newNotifications[0].createdAt; // use newest notification timestamp
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(newNotifications)}\n\n`));
        }
      }, 1500);
    },
    cancel() {
      clearInterval(interval);
      clearInterval(heartbeat);
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
