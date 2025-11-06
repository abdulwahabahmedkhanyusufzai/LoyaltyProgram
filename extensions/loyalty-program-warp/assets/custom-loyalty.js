document.addEventListener("DOMContentLoaded", async () => {
  // --- FETCH & RENDER OFFERS ---

  const offersContainer = document.querySelector(".loyal-1");
  if (offersContainer) {
    const staticCards = offersContainer.querySelectorAll(
      ".offer-card, .seprator"
    );
    staticCards.forEach((el) => el.remove());

    const loadingText = document.createElement("p");
    loadingText.textContent = "Loading offers...";
    loadingText.style.cssText =
      "color:#555;margin:20px 0;text-align:center;font-size:16px;";
    offersContainer.appendChild(loadingText);

    try {
      const response = await fetch("https://waro.d.codetors.dev/api/offers");
      if (!response.ok) throw new Error("Failed to fetch");
      console.log(response);

      const data = await response.json();
      const offers = data.offers.slice(0, 3); // ✅ FIX — extract the array

      loadingText.remove();

      if (!Array.isArray(offers) || offers.length === 0) {
        const emptyMsg = document.createElement("p");
        emptyMsg.textContent =
          "No active offers available right now. Please check back later.";
        emptyMsg.style.cssText = "color:#777;text-align:center;font-size:15px;";
        offersContainer.appendChild(emptyMsg);
      } else {
        offers.forEach((offer, index) => {
          const offerCard = document.createElement("div");
          offerCard.className = "offer-card";
          offerCard.innerHTML = `
            <img
              src="${
                offer.image ||
                "https://cdn.shopify.com/s/files/1/0921/8428/1416/files/default-offer.jpg"
              }"
              alt="${offer.name || "Offer"}"
              style="width:60px;height:60px;border-radius:50%;object-fit:cover;"
            />
            <div class="offer-text">
              <strong>${offer.name || "Special Offer"}</strong>
              <p>${
                offer.description ||
                "Enjoy exclusive rewards on your next order."
              }</p>
            </div>
            <button class="offer-btn">${
              offer.buttonLabel || "Shop Now"
            }</button>
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
      console.error("Error fetching offers:", err);
      loadingText.textContent = "Error loading offers. Please try again later.";
    }
  }

  try {
    const encodedEmail = encodeURIComponent(customerEmail);
    if (encodedEmail) {
      const response = await fetch(
        `https://waro.d.codetors.dev/api/customers/email/${encodedEmail}`
      );
      if (!response.ok) throw new Error("Failed to fetch customer data");

      const data = await response.json();
      console.log("✅ Customer data:", data);
      const loyaltyPoints = data.loyaltyPoints;
      console.log("loyalty Points", loyaltyPoints);
      const loyaltyTitle = data.loyaltyTitle;
      const tierElement = document.querySelector(".corner-text p");
      let nextTier = document.querySelector(".next_tier");
      // Example: update the points in the banner dynamically
      const pointsElement = document.querySelector(".banner_point");
      
      //progress_bar 
      const progress_bar = document.querySelector(".progress");
      const progress_value = progress_bar.style.getPropertyValue('--value');
      console.log(progress_value);

      //progress_bar note
      const progress_note = document.querySelector(".progress_about");
      console.log(progress_note);


      if (pointsElement && loyaltyPoints !== null) {
        console.log("Here is loyalty");
        pointsElement.textContent = `(${loyaltyPoints})`;
      }
      if (loyaltyTitle && tierElement) {
        tierElement.textContent = loyaltyTitle;
      }
      let pointsToNext = 0;
      if (loyaltyPoints <= 200) {
        nextTier.textContent = "Bronze";
        progress_percent = (loyaltyPoints / 200) * 100;
        pointsToNext = 200 - loyaltyPoints;
        progress_note.textContent = `Earn ${pointsToNext} more points to reach Bronze`;
        progress_bar.style.setProperty('--value' ,`${progress_percent}%`); 
      } else if (loyaltyPoints <= 500) {
        nextTier.textContent = "Silver";
        progress_percent = (loyaltyPoints / 500) * 100;
        pointsToNext = 500 - loyaltyPoints;
        progress_note.textContent = `Earn ${pointsToNext} more points to reach Silver`;
        progress_bar.style.setProperty('--value' ,`${progress_percent}%`); 
      } else if (loyaltyPoints <= 750) {
        nextTier.textContent = "Gold";
        progress_percent = (loyaltyPoints / 750) * 100; 
        progress_note.textContent = `Earn ${pointsToNext} more points to reach Gold`;
        pointsToNext = 750 - loyaltyPoints;
        progress_bar.style.setProperty('--value' ,`${progress_percent}%`); 

      } else if (loyaltyPoints < 1000) {
        nextTier.textContent = "Platinum";
        progress_note.textContent = `Earn ${pointsToNext} more points to reach Platinum`;
        progress_percent = (loyaltyPoints / 750) * 100; 
        pointsToNext = 1000 - loyaltyPoints;
        progress_bar.style.setProperty('--value' ,`${progress_percent}%`); 

      } else {
        next_tier.textContent = "Elite";
        pointsToNext = 0; // already maxed out
      }
      
    } else {
      console.warn("⚠️ No logged-in customer found");
    }
  } catch (err) {
    console.error("❌ Error fetching customer:", err);
  }

  // --- MOVE BANNER CORNER ---
  const upperBanner = document.querySelector(".content-for-layout ");
  const bannerCorner = document.querySelector(".corner_style");
  if (upperBanner && bannerCorner) {
    upperBanner.prepend(bannerCorner);
    console.log("✅ banner_corner moved inside upperBanner");
  } else {
    console.warn("⚠️ upperBanner or banner_corner not found.");
  }
  // --- INITIALIZE PRODUCT SCROLLS ---
  initProductScrolls();
});

// --- DRAGGABLE PRODUCT SCROLL FUNCTION ---
function initProductScrolls() {
  const containers = document.querySelectorAll(".product-scroll");
  if (!containers.length) return;

  containers.forEach((container) => {
    if (container.__dragInit) return;
    container.__dragInit = true;

    container.classList.add("product-scroll-init");
    let isDragging = false;
    let startX = 0;
    let startScroll = 0;

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

    const stopDrag = (e) => {
      if (!isDragging) return;
      isDragging = false;
      container.classList.remove("is-dragging");
      try {
        container.releasePointerCapture &&
          container.releasePointerCapture(e && e.pointerId);
      } catch {}
      document.documentElement.style.userSelect = "";
    };

    container.addEventListener("pointerup", stopDrag);
    container.addEventListener("pointercancel", stopDrag);
    container.addEventListener("pointerleave", stopDrag);

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

    const imgs = container.querySelectorAll("img");
    imgs.forEach((img) => {
      img.style.touchAction = "none";
    });
  });
}
