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
export const getCustomerTier = (points) =>
  LOYALTY_TIERS.find((tier) => points >= tier.min && points <= tier.max) || LOYALTY_TIERS[0];