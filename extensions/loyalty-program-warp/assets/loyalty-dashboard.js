(() => {
  const progressBar = document.querySelector(".tier-bar");
  const fill = progressBar?.querySelector(".tier-fill");
  const pointsEl = document.querySelector(".points-info h1");
  const tierText = document.querySelector(".tier-text");
  const tierProgressContainer = document.querySelector(".tier-progress");
  const badgeUnfulfilled = document.querySelector(".unfulfilled");

  if (!progressBar || !fill || !tierProgressContainer) return;

  // -----------------------------
  // Loader
  // -----------------------------
  const loader = document.createElement("div");
  loader.className = "loyalty-loader";
  loader.style.cssText = `
    width: 40px; height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #734A00;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 20px auto;
  `;
  progressBar.parentElement.insertBefore(loader, progressBar);
  progressBar.style.display = "none";

  // -----------------------------
  // Tiers
  // -----------------------------
  const tiers = [
    { name: "Bronze", min: 200 },
    { name: "Silver", min: 500 },
    { name: "Gold", min: 750 },
    { name: "Platinum", min: 1000 },
  ];
  const tierElements = Array.from(tierProgressContainer.querySelectorAll(".tier"));
  const maxPoints = tiers[tiers.length - 1].min;

  tierElements.forEach((el, i) => {
    el.style.left = `${(tiers[i].min / maxPoints) * 100}%`;
    el.dataset.tier = tiers[i].name;
  });

  // -----------------------------
  // Helpers
  // -----------------------------
  const animateBar = (percent, instant = false) => {
    fill.style.transition = instant ? "none" : "width 0.5s ease-in-out";
    fill.style.width = `${percent}%`;
    console.log(`[DEBUG] Progress bar: ${percent.toFixed(1)}%`);
  };

  const highlightActiveTier = (tierName) => {
    tierElements.forEach(el => {
      el.classList.toggle("active-tier", el.dataset.tier === tierName);
    });
    console.log(`[DEBUG] Highlighted tier: ${tierName}`);
  };

  const updateUI = (points, currentTierName) => {
    const currentTier = tiers.find(t => t.name === currentTierName) || { name: "Welcome", min: 0 };
    const nextTier = tiers.find(t => t.min > points);
    const progressPercent = nextTier
      ? ((points - currentTier.min) / (nextTier.min - currentTier.min)) * 100
      : 100;
    const tierMessage = nextTier
      ? `You're ${nextTier.min - points} points away from ${nextTier.name} Tier`
      : `You've reached the ${currentTier.name} Tier!`;

    pointsEl.textContent = points;
    tierText.textContent = tierMessage;
    badgeUnfulfilled.textContent = `+${points}`;

    animateBar(progressPercent);
    highlightActiveTier(currentTier.name);

    console.log(`[DEBUG] Points: ${points}, Current: ${currentTier.name}, Next: ${nextTier?.name || "Max"}`);
  };

  const hideLoader = () => {
    loader.remove();
    progressBar.style.display = "";
  };

  // -----------------------------
  // Load metafields directly
  // -----------------------------
  const loadLoyaltyData = () => {
    try {
      const points = parseInt(customerMetafieldPoints || "0", 10);
      const tier = customerMetafieldTier || "Welcome";
      updateUI(points, tier);
    } catch (err) {
      console.error("❌ Error updating loyalty UI:", err);
      updateUI(0, "Welcome");
    } finally {
      hideLoader();
    }
  };

  // -----------------------------
  // Default state
  // -----------------------------
  updateUI(0, "Welcome");

  // Load actual data
  if (typeof customerMetafieldPoints !== "undefined" && typeof customerMetafieldTier !== "undefined") {
    loadLoyaltyData();
  } else {
    console.warn("[WARN] Metafields not available for customer.");
    hideLoader();
  }
})();
