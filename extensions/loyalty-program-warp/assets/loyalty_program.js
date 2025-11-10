document.addEventListener("DOMContentLoaded", () => {
  const slider = document.querySelector(".product-scroll");
  let isDown = false;
  let startX;
  let scrollLeft;
  let isDragging = false;

  if (!slider) return;

  slider.addEventListener("mousedown", e => {
    isDown = true;
    isDragging = false;
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
    slider.classList.add("is-dragging");
  });

  slider.addEventListener("mouseleave", () => {
    isDown = false;
    slider.classList.remove("is-dragging");
  });

  slider.addEventListener("mouseup", e => {
    slider.classList.remove("is-dragging");
    // if it was dragging, prevent click
    if (isDragging) {
      e.preventDefault();
    }
    isDown = false;
  });

  slider.addEventListener("mousemove", e => {
    if (!isDown) return;
    e.preventDefault();
    isDragging = true;
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 2; // adjust for speed
    slider.scrollLeft = scrollLeft - walk;
  });

  // Mobile touch support
  let touchStartX = 0;
  slider.addEventListener("touchstart", e => {
    touchStartX = e.touches[0].pageX;
    scrollLeft = slider.scrollLeft;
  });
  slider.addEventListener("touchmove", e => {
    const x = e.touches[0].pageX;
    const walk = (x - touchStartX) * 2;
    slider.scrollLeft = scrollLeft - walk;
  });
});
