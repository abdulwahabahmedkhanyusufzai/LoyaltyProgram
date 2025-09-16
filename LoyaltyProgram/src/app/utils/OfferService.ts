import { Offer } from "../models/Offer";

export class OfferService {
  static async saveOffer(offer: Offer, isUpdate = false, id?: string) {
    const formDataToSend = new FormData();
    formDataToSend.append("name", offer.offerName);
    formDataToSend.append("description", offer.description);
    formDataToSend.append("startDate", offer.startDate);
    formDataToSend.append("endDate", offer.tillDate);
    if (offer.points !== undefined && offer.points !== null)
      formDataToSend.append("pointsCost", String(offer.points));
    offer.eligibleTiers.forEach((tier) => formDataToSend.append("tiers", tier));

    // Only append image when the image is a File (new upload). If it's a string URL, skip it.
    if (offer.image instanceof File) {
      formDataToSend.append("image", offer.image);
    }

    const url = isUpdate && id ? `/api/offers/${id}` : "/api/offers";
    const method = isUpdate ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      body: formDataToSend,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "unknown" }));
      throw new Error(error.error || "Failed to save offer");
    }

    return await res.json();
  }
}
