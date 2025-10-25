import { OFFER_TYPES } from "../constants/offerTypes";
import type { Offer } from "../models/Offer";

export function validateOfferField(offer: Offer, field: keyof Offer): string {
  try {
    switch (field) {
      case "offerName":
        return offer.offerName.trim() ? "" : "Offer name is required.";

      case "description":
        return offer.description.trim() ? "" : "Description is required.";

      case "points": {
        if (["FREE_SHIPPING", "FREE_GIFT", "EARLY_ACCESS"].includes(offer.offerType))
          return ""; // not required

        if (!offer.points && offer.points !== 0) return "Points are required.";

        const val = String(offer.points).trim();

        if (offer.offerType === "FIXED_AMOUNT_DISCOUNT") {
          return /^\d+$/.test(val)
            ? ""
            : "Enter a valid number (e.g., 100).";
        }

        if (offer.offerType === "PERCENTAGE_DISCOUNT") {
          const num = Number(val);
          return num >= 0 && num <= 100
            ? ""
            : "Enter a valid discount percentage (0–100).";
        }

        return "";
      }

      case "startDate":
        return offer.startDate ? "" : "Start Date is required.";

      case "tillDate":
        return offer.tillDate ? "" : "Till Date is required.";

      case "eligibleTiers":
        return offer.eligibleTiers.trim()
          ? ""
          : "Select at least one eligible tier.";

      case "image":
        return offer.image ? "" : "Image is required.";

      case "offerType":
        return OFFER_TYPES.some((t) => t.offerType === offer.offerType)
          ? ""
          : "Select a valid offer type.";

      default:
        return "";
    }
  } catch (err) {
    console.error(`Error validating [${field}]:`, err);
    return `Validation failed for ${field}`;
  }
}
