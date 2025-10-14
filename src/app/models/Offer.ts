export class Offer {
  offerName: string = "";
  description: string = "";
  points: string | number = ""; // string like "20%" OR number like 100
  startDate: string = "";
  tillDate: string = "";
  eligibleTiers: string = ""; // ✅ required
  offerType: "DISCOUNT" | "CASHBACK" | "BOGO" = "DISCOUNT"; // ✅ Prisma enum
  image: File | string | null = null; // File (upload) OR string (URL)

  constructor(init?: Partial<Offer>) {
    if (init) {
      Object.assign(this, init);
    }
  }

  /**
   * Validate a single field.
   * Returns an error message (string) or "" if valid.
   */
  validateField(field: keyof Offer): string {
    try {
      switch (field) {
        case "offerName":
          return this.offerName.trim() ? "" : "Offer name is required.";

        case "description":
          return this.description.trim() ? "" : "Description is required.";

        case "points": {
          if (this.points === null || this.points === undefined) return "Points are required.";

          if (typeof this.points === "number") {
            return this.points >= 0 ? "" : "Points must be a positive number.";
          }

          if (typeof this.points === "string") {
            const p = this.points.trim();
            if (!p) return "Points are required.";
            const isNumber = /^\d+$/.test(p); // "10", "100"
            const isPercent = /^([1-9]\d?|100)%$/.test(p); // "1%" .. "100%"
            return isNumber || isPercent ? "" : "Enter number (100) or percentage (20%).";
          }

          return "Invalid points value.";
        }

        case "startDate":
          return this.startDate ? "" : "Start Date is required.";

        case "tillDate":
          return this.tillDate ? "" : "Till Date is required.";

        case "eligibleTiers":
          return this.eligibleTiers.trim().length > 0 ? "" : "Select at least one eligible tier.";

        case "image":
          return this.image !== null && String(this.image).trim() !== "" ? "" : "Image is required.";

        case "offerType":
          // ✅ Validate enum
          return ["DISCOUNT", "CASHBACK", "BOGO"].includes(this.offerType)
            ? ""
            : "Select a valid offer type.";

        default:
          return "";
      }
    } catch (err) {
      console.error(`❌ Error validating field [${field}]:`, err);
      return `Validation failed for ${field}`;
    }
  }

  /**
   * Validate all fields together.
   * Returns an object { fieldName: errorMessage }
   */
  validateAll(): Record<string, string> {
    const fields: (keyof Offer)[] = [
      "offerName",
      "description",
      "points",
      "startDate",
      "tillDate",
      "eligibleTiers",
      "image",
      "offerType", // ✅ include offerType
    ];

    const errors: Record<string, string> = {};

    fields.forEach((f) => {
      const err = this.validateField(f);
      if (err) {
        errors[f] = err;
        console.warn(`⚠️ Validation failed: ${f} → ${err}`);
      }
    });

    return errors;
  }

  /**
   * Throws an Error if validation fails (useful for debugging).
   */
  assertValid(): void {
    const errors = this.validateAll();
    if (Object.keys(errors).length > 0) {
      console.error("🚨 Offer validation failed with errors:", errors);
      throw new Error(JSON.stringify(errors));
    }
  }
}
