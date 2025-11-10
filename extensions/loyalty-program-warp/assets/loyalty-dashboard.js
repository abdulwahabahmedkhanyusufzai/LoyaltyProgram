(() => {
  const progressBar = document.querySelector(".tier-bar");
  const fill = progressBar?.querySelector(".tier-fill");
  const pointsEl = document.querySelector(".points-info h1");
  const tierText = document.querySelector(".tier-text");
  const tierProgressContainer = document.querySelector(".tier-progress");
  const badgeUnfulfilled = document.querySelector(".unfulfilled");

  // Create & show loader
  const loader = document.createElement('div');
  loader.className = 'loyalty-loader';
  loader.style.cssText = `
    width: 40px; height: 40px; border: 4px solid #f3f3f3;
    border-top: 4px solid #734A00; border-radius: 50%;
    animation: spin 1s linear infinite; margin: 20px auto;
  `;
  progressBar.parentElement.insertBefore(loader, progressBar);
  progressBar.style.display = 'none';

  if (!progressBar || !fill || !tierProgressContainer) return;

  const tiers = [
    { name: "Bronze", min: 200 },
    { name: "Silver", min: 500 },
    { name: "Gold", min: 750 },
    { name: "Platinum", min: 1000 },
  ];

  const tierElements = Array.from(tierProgressContainer.querySelectorAll(".tier"));
  const maxPoints = tiers[tiers.length - 1].min;

  tierElements.forEach((el, i) => el.style.left = `${(tiers[i].min / maxPoints) * 100}%`);

  const animateBar = (percent, instant = false) => {
    fill.style.transition = instant ? "none" : "width 0.5s ease-in-out";
    fill.style.width = `${percent}%`;
  };

  const highlightActiveTier = (tierName) => {
    const className = tierName.toLowerCase();
    tierElements.forEach(el => el.className = el.className.replace(/\s*active-tier/g, '') + (el.classList.contains(className) ? ' active-tier' : ''));
  };

  const getTier = points => tiers.slice().reverse().find(t => points >= t.min) || { name: "Welcome", min: 0 };

  const updateUI = (points, currentTier, nextTier) => {
    const progressPercent = nextTier
      ? ((points - currentTier.min) / (nextTier.min - currentTier.min)) * 100
      : 100;
    const tierMessage = nextTier
      ? `You're ${nextTier.min - points} points away from ${nextTier.name} Tier`
      : `You've reached the ${currentTier.name} Tier!`;

    pointsEl.textContent = points;
    tierText.textContent = tierMessage;
    badgeUnfulfilled.textContent = points;
    animateBar(progressPercent);
    highlightActiveTier(currentTier.name);
  };

  const hideLoader = () => {
    loader.remove();
    progressBar.style.display = '';
  };

  const loadLoyaltyData = async (email) => {
    if (!email) return hideLoader();
    try {
      const res = await fetch(`https://waro.d.codetors.dev/api/customers/email/${encodeURIComponent(email)}`);
      const data = res.ok ? await res.json() : {};
      const points = data.loyaltyPoints || 0;
      const currentTier = getTier(points);
      const nextTier = tiers.find(t => t.min > points);
      updateUI(points, currentTier, nextTier);
    } catch (err) {
      console.error(err);
      updateUI(0, { name: "Welcome", min: 0 }, null);
    } finally {
      hideLoader();
    }
  };

  // Show default "Join" state instantly while loader spins
  updateUI(0, { name: "Welcome", min: 0 }, null);

  if (typeof customerEmail !== "undefined" && customerEmail) loadLoyaltyData(customerEmail);
})();
