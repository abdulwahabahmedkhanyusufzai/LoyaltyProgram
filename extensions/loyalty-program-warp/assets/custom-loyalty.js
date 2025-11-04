document.addEventListener("DOMContentLoaded", async () => {
  console.log("🎯 Loyalty script loaded");

  // --- FETCH & RENDER OFFERS ---
  const offersContainer = document.querySelector(".loyal-1");
  if (offersContainer) {
    const staticCards = offersContainer.querySelectorAll(".offer-card, .seprator");
    staticCards.forEach((el) => el.remove());

    const loadingText = document.createElement("p");
    loadingText.textContent = "Loading offers...";
    loadingText.style.cssText = "color:#555;margin:20px 0;text-align:center;font-size:16px;";
    offersContainer.appendChild(loadingText);

    try {
      const response = await fetch("https://waro.d.codetors.dev/api/offers");
      if (!response.ok) throw new Error("Failed to fetch offers");
      const data = await response.json();
      const offers = data.offers.slice(0, 3);
      loadingText.remove();

      if (!Array.isArray(offers) || offers.length === 0) {
        const emptyMsg = document.createElement("p");
        emptyMsg.textContent = "No active offers available right now.";
        emptyMsg.style.cssText = "color:#777;text-align:center;font-size:15px;";
        offersContainer.appendChild(emptyMsg);
      } else {
        offers.forEach((offer, index) => {
          const offerCard = document.createElement("div");
          offerCard.className = "offer-card";
          offerCard.innerHTML = `
            <img src="${offer.image || 'https://cdn.shopify.com/s/files/1/0921/8428/1416/files/default-offer.jpg'}"
              alt="${offer.name || 'Offer'}" class="offer-image"/>
            <div class="offer-text">
              <strong>${offer.name || 'Special Offer'}</strong>
              <p>${offer.description || 'Enjoy exclusive rewards on your next order.'}</p>
            </div>
            <button class="offer-btn">${offer.buttonLabel || 'Shop Now'}</button>
          `;
          offersContainer.appendChild(offerCard);

          if (index !== offers.length - 1) {
            const hr = document.createElement("hr");
            hr.className = "seprator";
            offersContainer.appendChild(hr);
          }
        });
      }
    } catch (err) {
      console.error("❌ Error fetching offers:", err);
      loadingText.textContent = "Error loading offers. Please try again later.";
    }
  }

  // --- FETCH CUSTOMER DATA ---
  try {
    const customerEmail = "{{ customer.email | escape }}";
    if (customerEmail) {
      const encodedEmail = encodeURIComponent(customerEmail);
      const response = await fetch(`https://waro.d.codetors.dev/api/customers/email/${encodedEmail}`);
      if (!response.ok) throw new Error("Failed to fetch customer data");

      const data = await response.json();
      const loyaltyPoints = data.loyaltyPoints || 0;
      const loyaltyTitle = data.loyaltyTitle || "Member";

      const pointsElement = document.querySelector(".banner_point");
      const tierElement = document.querySelector(".corner-text p");
      const nextTierElement = document.querySelector(".next_tier");

      if (pointsElement) pointsElement.textContent = `(${loyaltyPoints})`;
      if (tierElement) tierElement.textContent = loyaltyTitle;

      let pointsToNext = 0;
      if (nextTierElement) {
        if (loyaltyPoints <= 200) {
          nextTierElement.textContent = "Bronze";
          pointsToNext = 200 - loyaltyPoints;
        } else if (loyaltyPoints <= 500) {
          nextTierElement.textContent = "Silver";
          pointsToNext = 500 - loyaltyPoints;
        } else if (loyaltyPoints <= 750) {
          nextTierElement.textContent = "Gold";
          pointsToNext = 750 - loyaltyPoints;
        } else if (loyaltyPoints < 1000) {
          nextTierElement.textContent = "Platinum";
          pointsToNext = 1000 - loyaltyPoints;
        } else {
          nextTierElement.textContent = "Elite";
          pointsToNext = 0;
        }
      }
    } else {
      console.warn("⚠️ No logged-in customer found");
    }
  } catch (err) {
    console.error("❌ Error fetching customer:", err);
  }

  // --- MOVE BANNER CORNER ---
  const upperBanner = document.querySelector(".content-for-layout");
  const bannerCorner = document.querySelector(".corner_style");
  if (upperBanner && bannerCorner) {
    upperBanner.prepend(bannerCorner);
  }

  // --- INIT PRODUCT SCROLL ---
  initProductScrolls();
});

function initProductScrolls() {
  const containers = document.querySelectorAll(".product-scroll");
  containers.forEach((container) => {
    if (container.__dragInit) return;
    container.__dragInit = true;

    let isDragging = false;
    let startX = 0;
    let startScroll = 0;

    container.addEventListener("pointerdown", (e) => {
      if (e.button && e.button !== 0) return;
      isDragging = true;
      startX = e.clientX;
      startScroll = container.scrollLeft;
      document.documentElement.style.userSelect = "none";
    });

    container.addEventListener("pointermove", (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      container.scrollLeft = startScroll - dx * 1.2;
    });

    const stopDrag = () => {
      isDragging = false;
      document.documentElement.style.userSelect = "";
    };

    container.addEventListener("pointerup", stopDrag);
    container.addEventListener("pointerleave", stopDrag);
    container.addEventListener("pointercancel", stopDrag);

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
  });
}
