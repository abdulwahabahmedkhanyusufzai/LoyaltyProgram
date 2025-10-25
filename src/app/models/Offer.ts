import { OFFER_TYPES } from "../constants/offerTypes";
import { validateOfferField } from "../utils/validateofFields";

export class Offer {
  id: string | number = "";
  offerName = "";
  name = "";
  description = "";
  points: string | number = "";
  startDate = "";
  tillDate = "";
  eligibleTiers = "";
  offerType:
    | "FIXED_AMOUNT_DISCOUNT"
    | "PERCENTAGE_DISCOUNT"
    | "FREE_SHIPPING"
    | "FREE_GIFT"
    | "EARLY_ACCESS" = "FIXED_AMOUNT_DISCOUNT";
  image: File | string | null = null;

  constructor(init?: Partial<Offer>) {
    Object.assign(this, init);
  }

  validateField(field: keyof Offer): string {
    return validateOfferField(this, field);
  }

  validateAll(): Record<string, string> {
    const fields: (keyof Offer)[] = [
      "offerName",
      "description",
      "points",
      "startDate",
      "tillDate",
      "eligibleTiers",
      "image",
      "offerType",
    ];

    const errors: Record<string, string> = {};
    for (const f of fields) {
      const err = this.validateField(f);
      if (err) errors[f] = err;
    }
    return errors;
  }

  assertValid(): void {
    const errors = this.validateAll();
    if (Object.keys(errors).length > 0) {
      throw new Error(JSON.stringify(errors));
    }
  }
}
