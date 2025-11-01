import { OFFER_TYPES } from "../constants/offerTypes";
import type { Offer } from "../models/Offer";

/**
 * Validates a single field in an Offer object.
 * Returns an empty string if valid, otherwise an error message.
 */
export function validateOfferField(offer: Offer, field: keyof Offer): string {
  try {
    switch (field) {
      case "offerName":
        return offer.offerName?.trim()
          ? ""
          : "Offer name is required.";

      case "description":
        return offer.description?.trim()
          ? ""
          : "Description is required.";
          
      case "startDate":
        return offer.startDate
          ? ""
          : "Start Date is required.";

      case "tillDate":
        if (!offer.tillDate) return "Till Date is required.";
        if (
          offer.startDate &&
          new Date(offer.tillDate) < new Date(offer.startDate)
        ) {
          return "Till Date cannot be before Start Date.";
        }
        return "";

      case "image":
        return offer.image
          ? ""
          : "Image is required.";

      case "offerType":
        return OFFER_TYPES.some((t) => t.offerType === offer.offerType)
          ? ""
          : "Select a valid offer type.";

      default:
        console.warn(`⚠️ No validation rule defined for field "${field}"`);
        return "";
    }
  } catch (err) {
    console.error(`❌ Error validating [${field}]:`, err);
    return `Validation failed for ${field}.`;
  }
}
