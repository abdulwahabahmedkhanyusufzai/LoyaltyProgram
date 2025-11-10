import { loadLoyaltyData } from "./loadLoyaltyData.js";

document.addEventListener("DOMContentLoaded", async () => {
  // --- CACHE DOM ELEMENTS ---
  const offersContainer = document.querySelector(".loyal-1");
  const tierElement = document.querySelector(".corner-text p");
  const nextTier = document.querySelector(".next_tier");
  const pointsElement = document.querySelector(".banner_point");
  const progress_bar = document.querySelector(".progress");
  const progress_note = document.querySelector(".progress_about");
  const upperBanner = document.querySelector(".content-for-layout ");
  const bannerCorner = document.querySelector(".corner_style");

  console.log("custom-loyalty.js loaded, customerEmail =", window.customerEmail);

  // --- TIERS DATA STRUCTURE ---
  const tiers = [
    { name: "Bronze", min: 200 },
    { name: "Silver", min: 500 },
    { name: "Gold", min: 750 },
    { name: "Platinum", min: 1000 },
  ];

  function getTier(loyaltyPoints) {
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (loyaltyPoints >= tiers[i].min) return tiers[i];
    }
    return { name: "Welcomed", min: 0 };
  }

  // --- FETCH & RENDER OFFERS ---
  if (offersContainer) {
    // Clear existing cards
    offersContainer
      .querySelectorAll(".offer-card, .seprator")
      .forEach((el) => el.remove());

    const loadingText = document.createElement("p");
    loadingText.textContent = "Loading offers...";
    loadingText.style.cssText =
      "color:#555;margin:20px 0;text-align:center;font-size:16px;";
    offersContainer.appendChild(loadingText);

    try {
      const response = await fetch("https://waro.d.codetors.dev/api/offers");
      if (!response.ok) throw new Error("Failed to fetch offers");
      const data = await response.json();
      const offers = data.offers.slice(0, 3);

      loadingText.remove();

      if (!Array.isArray(offers) || offers.length === 0) {
        const emptyMsg = document.createElement("p");
        emptyMsg.textContent =
          "No active offers available right now. Please check back later.";
        emptyMsg.style.cssText = "color:#777;text-align:center;font-size:15px;";
        offersContainer.appendChild(emptyMsg);
      } else {
        const fragment = document.createDocumentFragment();
        offers.forEach((offer, index) => {
          const offerCard = document.createElement("div");
          offerCard.className = "offer-card";
          offerCard.innerHTML = `
        <img src="${
          offer.image ||
          "https://cdn.shopify.com/s/files/1/0921/8428/1416/files/default-offer.jpg"
        }"
             alt="${offer.name || "Offer"}"
             style="width:60px;height:60px;border-radius:50%;object-fit:cover;" />
        <div class="offer-text">
          <strong>${offer.name || "Special Offer"}</strong>
          <p>${
            offer.description || "Enjoy exclusive rewards on your next order."
          }</p>
        </div>
        <button class="offer-btn">${offer.buttonLabel || "Shop Now"}</button>
      `;
          fragment.appendChild(offerCard);

          if (index !== offers.length - 1) {
            const hr = document.createElement("hr");
            hr.className = "seprator";
            fragment.appendChild(hr);
          }
        });
        offersContainer.appendChild(fragment);
      }
    } catch (err) {
      console.error("Error fetching offers:", err);
      loadingText.textContent = "Error loading offers. Please try again later.";
    }
  }

  // --- FETCH CUSTOMER DATA & UPDATE LOYALTY ---
 loadLoyaltyData({
  customerEmail,
  pointsElement: pointsElement,
  tierElement: tierElement,
  nextTier: nextTier,
  progress_bar: progress_bar,
  progress_note: progress_note,
  getTier,
  tiers,
});

  // --- MOVE BANNER CORNER ---
  if (upperBanner && bannerCorner) {
    upperBanner.prepend(bannerCorner);
  }

  // --- INITIALIZE PRODUCT SCROLLS ---
  initProductScrolls();
});

// --- DRAGGABLE PRODUCT SCROLL FUNCTION ---
export function initProductScrolls() {
  const containers = document.querySelectorAll(".product-scroll");
  if (!containers.length) return;

  containers.forEach((container) => {
    if (container.__dragInit) return;
    container.__dragInit = true;

    container.classList.add("product-scroll-init");
    let isDragging = false,
      startX = 0,
      startScroll = 0;

    const stopDrag = (e) => {
      if (!isDragging) return;
      isDragging = false;
      container.classList.remove("is-dragging");
      try {
        container.releasePointerCapture &&
          container.releasePointerCapture(e.pointerId);
      } catch {}
      document.documentElement.style.userSelect = "";
    };

    container.addEventListener("pointerdown", (e) => {
      if (e.button && e.button !== 0) return;
      isDragging = true;
      container.classList.add("is-dragging");
      startX = e.clientX;
      startScroll = container.scrollLeft;
      container.setPointerCapture(e.pointerId);
      document.documentElement.style.userSelect = "none";
    });

    container.addEventListener("pointermove", (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      container.scrollLeft = startScroll - dx * 1.2;
    });

    ["pointerup", "pointercancel", "pointerleave"].forEach((evt) => {
      container.addEventListener(evt, stopDrag);
    });

    container.addEventListener(
      "wheel",
      (e) => {
        if (Math.abs(e.deltaX) > 0.5) return;
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          container.scrollLeft += e.deltaY;
          e.preventDefault();
        }
      },
      { passive: false }
    );

    container.setAttribute("tabindex", "0");
    container.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") container.scrollLeft += 160;
      if (e.key === "ArrowLeft") container.scrollLeft -= 160;
    });

    container
      .querySelectorAll("img")
      .forEach((img) => (img.style.touchAction = "none"));
  });
}
