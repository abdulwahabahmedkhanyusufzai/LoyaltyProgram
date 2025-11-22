// /app/api/notifications/stream/route.ts
import { prisma } from "@/lib/prisma";

export async function GET() {
  const encoder = new TextEncoder();

  return new Response(
    new ReadableStream({
      start(controller) {
        let lastCheck = new Date();

        const interval = setInterval(async () => {
          const newNotifications = await prisma.notification.findMany({
            where: { createdAt: { gt: lastCheck } },
            orderBy: { createdAt: "desc" },
          });

          if (newNotifications.length > 0) {
            lastCheck = new Date();

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(newNotifications)}\n\n`)
            );
          }
        }, 1500);

        controller.enqueue(encoder.encode("event: connected\ndata: ok\n\n"));

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
