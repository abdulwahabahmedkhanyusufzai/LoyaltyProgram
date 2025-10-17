document.addEventListener("DOMContentLoaded", () => {
  // Detect homepage
  const isHomePage = window.location.pathname === "/" || window.location.pathname.includes("/index");
  if (!isHomePage) return;

  // Try to find a main container
  const banner = document.querySelector("#upperBanner") || document.querySelector("main") || document.body;

  if (!banner) return;

  // Create loyalty program block
  const loyaltyDiv = document.createElement("div");
  loyaltyDiv.id = "loyaltyBanner";
  loyaltyDiv.style.cssText = `
    margin: 40px auto;
    padding: 24px;
    max-width: 1200px;
    border-radius: 16px;
    background: linear-gradient(90deg, #f8f9fb, #e5e7eb);
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    text-align: center;
  `;

  // Add your content
  loyaltyDiv.innerHTML = `
    <h2 style="color:#111827;font-size:28px;margin-bottom:10px;">Join Our Loyalty Program 🎁</h2>
    <p style="color:#4b5563;font-size:16px;margin-bottom:15px;">
      Earn rewards every time you shop. Sign up today and start saving!
    </p>
    <a href="/pages/loyalty-program" 
       style="display:inline-block;background:#16a34a;color:#fff;padding:10px 20px;
              border-radius:8px;text-decoration:none;font-weight:600;">
       Learn More
    </a>
  `;

  // Inject into homepage
  banner.insertAdjacentElement("afterend", loyaltyDiv);
});
