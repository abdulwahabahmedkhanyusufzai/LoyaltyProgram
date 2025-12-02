document.addEventListener("DOMContentLoaded", () => {
  console.log("Loyalty Dashboard JS Loaded");
  
  // -----------------------------
  // Initial UI Setup (Progress Bar)
  // -----------------------------
  const progressBar = document.querySelector(".tier-bar");
  const fill = progressBar?.querySelector(".tier-fill");
  const pointsEl = document.querySelector(".points-info h1");
  const tierText = document.querySelector(".tier-text");
  const tierProgressContainer = document.querySelector(".tier-progress");
  const badgeUnfulfilled = document.querySelector(".unfulfilled");

  if (progressBar && fill && tierProgressContainer) {
    // Loader
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

    // Tiers Setup
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

    // Helpers
    const animateBar = (percent, instant = false) => {
      fill.style.transition = instant ? "none" : "width 0.5s ease-in-out";
      fill.style.width = `${percent}%`;
    };

    const highlightActiveTier = (tierName) => {
      tierElements.forEach(el => {
        el.classList.toggle("active-tier", el.dataset.tier === tierName);
      });
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

      if(pointsEl) pointsEl.textContent = points;
      if(tierText) tierText.textContent = tierMessage;
      if(badgeUnfulfilled) badgeUnfulfilled.textContent = `+${points}`;

      animateBar(progressPercent);
      highlightActiveTier(currentTier.name);
    };

    const hideLoader = () => {
      loader.remove();
      progressBar.style.display = "";
    };

    // Load Data
    const loadLoyaltyData = () => {
      try {
        // These variables are injected by liquid or defined globally? 
        // If they are liquid variables, they won't be available here unless defined in a script tag.
        // Assuming they are defined in global scope by liquid.
        const points = typeof customerMetafieldPoints !== 'undefined' ? parseInt(customerMetafieldPoints || "0", 10) : 0;
        const tier = typeof customerMetafieldTier !== 'undefined' ? customerMetafieldTier : "Welcome";
        updateUI(points, tier);
      } catch (err) {
        console.error("❌ Error updating loyalty UI:", err);
        updateUI(0, "Welcome");
      } finally {
        hideLoader();
      }
    };

    updateUI(0, "Welcome");
    if (typeof customerMetafieldPoints !== "undefined") {
      loadLoyaltyData();
    } else {
      hideLoader();
    }
  }
});

// -----------------------------
// Global Event Delegation (Handles dynamic elements)
// -----------------------------
document.addEventListener("click", async (e) => {
  const dashboard = document.querySelector(".loyalty-dashboard");
  const modal = document.querySelector(".redemption-modal");
  
  // 1. Earn Button
  if (e.target.closest(".earn-btn")) {
    const saleSection = document.querySelector(".loyalty-sale-product") || document.querySelector(".loyal-2");
    if (saleSection) {
      saleSection.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = "/collections/all";
    }
  }

  // 2. Redeem Button (Open Modal)
  if (e.target.closest(".redeem-btn")) {
    console.log("Redeem button clicked (delegated)");
    if (modal) {
      modal.style.display = "flex";
    } else {
      console.error("Redemption modal not found");
    }
  }

  // 3. Close Modal
  if (e.target.closest(".close-modal") || e.target === modal) {
    if (modal) modal.style.display = "none";
  }

  // 4. Confirm Redemption
  const confirmBtn = e.target.closest(".redeem-confirm-btn");
  if (confirmBtn) {
    const item = confirmBtn.closest(".reward-item");
    const rewardId = item.dataset.id;
    const pointsCost = parseInt(item.dataset.points);
    const title = item.dataset.title;
    const customerId = dashboard?.dataset.customerId;
    const apiUrl = dashboard?.dataset.apiUrl;

    if (!confirm(`Are you sure you want to redeem ${pointsCost} points for ${title}?`)) return;

    const originalText = confirmBtn.textContent;
    confirmBtn.textContent = "Processing...";
    confirmBtn.disabled = true;

    try {
      const res = await fetch(`${apiUrl}/api/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, rewardId })
      });

      const data = await res.json();

      if (data.success) {
        alert(`Success! Your discount code is: ${data.code}`);
        if (modal) modal.style.display = "none";
        // Reload to update points or update UI locally if possible
        window.location.reload(); 
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error("Redemption failed", err);
      alert("Something went wrong. Please try again.");
    } finally {
      confirmBtn.textContent = originalText;
      confirmBtn.disabled = false;
    }
  }
});
