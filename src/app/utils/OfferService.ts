import { Offer } from "../models/Offer";

export class OfferService {
  static async saveOffer(offer: Offer, isUpdate = false, id?: string) {
    console.log("💾 Saving offer payload:", JSON.stringify(offer, null, 2));
    console.log("🔧 isUpdate:", isUpdate, "id:", id);

    const formDataToSend = new FormData();

    // Required fields
    formDataToSend.append("name", offer.offerName ?? "");
    formDataToSend.append("description", offer.description ?? "");
    formDataToSend.append("startDate", String(offer.startDate ?? ""));
    formDataToSend.append("endDate", String(offer.tillDate ?? ""));

    // Optional fields
   

    if (offer.offerType != null) {
      formDataToSend.append("offerType", offer.offerType);
    }

    // Handle image
    if (offer.image instanceof File) {
      formDataToSend.append("image", offer.image);
    } else if (typeof offer.image === "string") {
      // 🔥 Important: backend may NOT accept string here!
      console.warn("⚠️ Image is a string, not sending file. Value:", offer.image);
    }

    // Debug print all FormData entries
    console.group("📦 FormData being sent");
    for (const [key, value] of formDataToSend.entries()) {
      console.log(`${key}:`, value);
    }
    console.groupEnd();

    const url = isUpdate && id ? `/api/offers/${id}` : "/api/offers";
    const method = isUpdate ? "PUT" : "POST";

    console.log(`🚀 Sending ${method} request to ${url}`);

    try {
      const res = await fetch(url, {
        method,
        body: formDataToSend,
      });

      // Explicitly check response status
      if (!res.ok) {
        const text = await res.text();
        console.error("❌ API Error Response:", res.status, res.statusText, text);
        throw new Error(`API ${method} ${url} failed: ${res.status} ${text}`);
      }

      const data = await res.json().catch(() => null);
      console.log("✅ API Success:", data);
      return data;
    } catch (err) {
      console.error("🔥 saveOffer crashed:", err);
      throw err;
    }
  }
}
