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
// -----------------------------
// Global Event Delegation (Handles dynamic elements)
// -----------------------------

// Tier Configuration mapping to codes
// Based on backend scripts:
// Bronze: 14 EUR, 10%
// Silver: 35 EUR, 10%, Free Shipping
// Gold: 49 EUR, 10%, Free Shipping
// Platinum: 80 EUR, 15%, Free Shipping
const TIER_CODES = {
  "Bronze": [
    { type: "Fixed Amount", code: "BRONZE14", label: "€14 Off" },
    { type: "Percentage", code: "BRONZE10", label: "10% Off" },
    // Bronze typically no free shipping in scripts
  ],
  "Silver": [
    { type: "Fixed Amount", code: "SILVER35", label: "€35 Off" },
    { type: "Percentage", code: "SILVER10", label: "10% Off" },
    { type: "Free Shipping", code: "SILVERFREESHIP", label: "Free Shipping" }
  ],
  "Gold": [
    { type: "Fixed Amount", code: "GOLD49", label: "€49 Off" },
    { type: "Percentage", code: "GOLD10", label: "10% Off" },
    { type: "Free Shipping", code: "GOLDFREESHIP", label: "Free Shipping" }
  ],
  "Platinum": [
    { type: "Fixed Amount", code: "PLATINUM80", label: "€80 Off" },
    { type: "Percentage", code: "PLATINUM15", label: "15% Off" },
    { type: "Free Shipping", code: "PLATINUMFREESHIP", label: "Free Shipping" }
  ]
};

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

  // 2. Redeem Button (Open Modal & Populate UI)
  if (e.target.closest(".redeem-btn")) {
    console.log("Redeem button clicked");
    if (modal) {
      // populate modal based on current Tier
      // Note: we can read the tier from the dashboard or global variable if accessible
      // The init script earlier sets `customerMetafieldTier` but it's local scope.
      // However, we can try to find the active tier from the progress bar or data attribute.
      // Let's rely on the text content or a dedicated data attribute we might fallback to.
      
      // Attempt to read tier from liquid injected data attribute if we added one, 
      // or try to parse it from the UI. 
      // Best way: The liquid file has `var customerMetafieldTier` logic. 
      // But passing it to this delegated listener is tricky without a global.
      // Let's look for the active tier element in the DOM.
      // JS updates use 'active-tier', Liquid uses 'active'. Check both.
      const activeTierEl = document.querySelector(".tier.active") || document.querySelector(".tier.active-tier");
      
      let currentTier = "Welcome"; 
      if (activeTierEl) {
        currentTier = activeTierEl.dataset.tier;
      } else {
        // Fallback: Check the text "You've reached the Silver Tier!"
        const tierText = document.querySelector(".tier-text")?.textContent || "";
        if (tierText.includes("Bronze")) currentTier = "Bronze";
        if (tierText.includes("Silver")) currentTier = "Silver";
        if (tierText.includes("Gold")) currentTier = "Gold";
        if (tierText.includes("Platinum")) currentTier = "Platinum";
      }

      console.log("Detected Tier for Rewards:", currentTier);

      const listContainer = document.getElementById("tier-rewards-list");
      const noRewardsMsg = document.getElementById("no-tier-rewards-msg");
      
      if (listContainer) {
        listContainer.innerHTML = ""; // Clear old
        const rewards = TIER_CODES[currentTier] || [];
        
        if (rewards.length === 0) {
          if(noRewardsMsg) noRewardsMsg.style.display = "block";
        } else {
          if(noRewardsMsg) noRewardsMsg.style.display = "none";
          rewards.forEach(r => {
            const li = document.createElement("div");
            li.className = "reward-item";
            li.style.cssText = "display:flex; justify-content:space-between; align-items:center; border:1px solid #ddd; padding:10px; margin-bottom:10px; border-radius:8px; background:#fff;";
            li.innerHTML = `
              <div class="reward-info">
                <h4 style="margin:0; font-weight:bold;">${r.label}</h4>
                <p style="margin:0; font-size:12px; color:#555;">${r.type}</p>
                <code style="background:#eee; padding:2px 4px; border-radius:4px; font-weight:bold;">${r.code}</code>
              </div>
              <button class="copy-btn" data-code="${r.code}" style="cursor:pointer; padding:5px 12px; background:#2C2A25; color:#fff; border:none; border-radius:20px; font-size:12px;">Copy</button>
            `;
            listContainer.appendChild(li);
          });
        }
      }

      modal.style.display = "flex";
    }
  }

  // 3. Close Modal
  if (e.target.closest(".close-modal") || e.target === modal) {
    if (modal) modal.style.display = "none";
  }

  // 4. Copy Code Action
  if (e.target.closest(".copy-btn")) {
    const btn = e.target.closest(".copy-btn");
    const code = btn.dataset.code;
    const originalText = btn.textContent;
    
    try {
      await navigator.clipboard.writeText(code);
      btn.textContent = "Copied!";
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    } catch (err) {
      console.error("Failed to copy", err);
      // Fallback
      prompt("Copy this code:", code);
    }
  }
});
