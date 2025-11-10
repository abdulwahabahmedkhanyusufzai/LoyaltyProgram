// loyalty.js
export async function loadLoyaltyData({
  customerEmail,
  pointsElement,
  tierElement,
  nextTier,
  progress_bar,
  progress_note,
  getTier,
  tiers,
}) {
  try {
    const encodedEmail = encodeURIComponent(customerEmail);
    if (!encodedEmail) throw new Error("No logged-in customer found");

    const response = await fetch(
      `https://waro.d.codetors.dev/api/customers/email/${encodedEmail}`
    );
    if (!response.ok) throw new Error("Failed to fetch customer data");

    const data = await response.json();
    const loyaltyPoints = data.loyaltyPoints || 0;
    const tier = getTier(loyaltyPoints);
    const nextTierInfo = tiers.find((t) => t.min > loyaltyPoints);
    const nextTierName = nextTierInfo?.name || "Completed";
    const pointsToNext = nextTierInfo ? nextTierInfo.min - loyaltyPoints : 0;
    const progressPercent = nextTierInfo
      ? (loyaltyPoints / nextTierInfo.min) * 100
      : 100;

    if (pointsElement)
      pointsElement.textContent = `(${loyaltyPoints})`;
    if (tierElement)
      tierElement.textContent = tier.name;
    if (nextTier)
      nextTier.textContent = nextTierName;
    if (progress_bar)
      progress_bar.style.setProperty("--value", `${progressPercent}%`);
    if (progress_note)
      progress_note.textContent = pointsToNext
        ? `Earn ${pointsToNext} more points to reach ${nextTierName}`
        : "You have reached the maximum tier!";
  } catch (err) {
    console.error("Error fetching customer data:", err);
  }
}
