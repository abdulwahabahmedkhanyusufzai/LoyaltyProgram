import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  // Get locale from cookie, fallback to 'en'
  const cookieStore = await cookies();
  const userLanguage = cookieStore.get("userLanguage")?.value || "en";

  // Map "English" and "French" to locale codes
  const locale = userLanguage.toLowerCase() === "french" ? "fr" : "en";

  // List of message files to merge
  const messageFiles = [
    "stats",
    "loyaltyTable",
    "nav",
    "header",
    "analytics",
    "calendar",
    "tabs",
    "loyalCustomer",
    "sendEmail",
    "customer",
    "homeSection",
  ];

  // Dynamically import all files
  const messagesArray = await Promise.all(
    messageFiles.map(async (file) => {
      const module = await import(`../messages/${locale}/${file}.json`);
      return module.default;
    })
  );

  // Merge all messages into one object
  const messages = Object.assign({}, ...messagesArray);

  return {
    locale,
    messages,
  };
});
