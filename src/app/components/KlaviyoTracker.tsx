"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function KlaviyoTracker() {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Fetch user email once on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user?.email) {
            setUserEmail(data.user.email);
          }
        }
      } catch (err) {
        // Silent fail for tracking
      }
    };
    fetchUser();
  }, []);

  // Track page view when path changes
  useEffect(() => {
    if (!userEmail) return;

    const trackPageView = async () => {
      try {
        await fetch("/api/klaviyo-track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventName: "Page Viewed",
            email: userEmail,
            properties: {
              path: pathname,
              title: document.title,
            },
          }),
        });
      } catch (err) {
        console.error("Failed to track page view", err);
      }
    };

    trackPageView();
  }, [pathname, userEmail]);

  return null;
}
