export const LOYALTY_TIERS = [
  { name: "No Tier", img: "", min: 0, max: 199, multiplier: 0 },
  { name: "Bronze", img: "bronze.png", min: 200, max: 499, multiplier: 1 },
  { name: "Silver", img: "silver.png", min: 500, max: 749, multiplier: 1.5 },
  { name: "Gold", img: "gold.png", min: 750, max: 999, multiplier: 2 },
  { name: "Platinum", img: "gem.png", min: 1000, max: Infinity, multiplier: 2.5 },
];

/**
 * Pure function to determine a customer's current tier based on their points.
 * @param {number} points - The customer's loyalty points.
 * @returns {object} The current tier object.
 */
export const getCustomerTier = (points: number) =>
  LOYALTY_TIERS.find((tier) => points >= tier.min && points <= tier.max) || LOYALTY_TIERS[0];

export const TIER_BENEFITS = {
  "Bronze": {
    benefits: ["Free Shipping on orders over $50", "Early access to sales"],
    discountCode: "WELCOME_BRONZE_10"
  },
  "Silver": {
    benefits: ["Free Shipping on all orders", "1.5x Points Multiplier", "Birthday Gift"],
    discountCode: "SILVER_STATUS_20"
  },
  "Gold": {
    benefits: ["Priority Support", "2x Points Multiplier", "Exclusive Events"],
    discountCode: "GOLD_MEMBER_25"
  },
  "Platinum": {
    benefits: ["Personal Concierge", "2.5x Points Multiplier", "All previous benefits"],
    discountCode: "PLATINUM_ELITE_30"
  }
};