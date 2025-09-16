import { Offer } from "../models/Offer";

export class OfferService {
  static async saveOffer(offer: Offer, isUpdate = false, id?: string) {
    const formDataToSend = new FormData();
    formDataToSend.append("name", offer.offerName);
    formDataToSend.append("description", offer.description);
    formDataToSend.append("startDate", offer.startDate);
    formDataToSend.append("endDate", offer.tillDate);
    if (offer.points) formDataToSend.append("pointsCost", offer.points.toString());
    offer.eligibleTiers.forEach((tier) =>
      formDataToSend.append("tiers", tier)
    );
    if (offer.image) formDataToSend.append("image", offer.image);

    const url = isUpdate && id ? `/api/offers/${id}` : "/api/offers";
    const method = isUpdate ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      body: formDataToSend,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to save offer");
    }

    return await res.json();
  }
}
