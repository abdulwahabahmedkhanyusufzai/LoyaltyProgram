'use client';
import React, { useRef } from 'react';

const products = [
  { src: 'grainbag.png', alt: 'Grain Bag' },
  { src: 'towel.png', alt: 'Towel' },
  { src: 'shawl.png', alt: 'Shawl' },
  { src: 'towel.png', alt: 'Towel' }, // duplicate if needed
];

export const TopSellingProducts = () => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const getClientX = (e) => {
    if (e.touches?.length) return e.touches[0].clientX;
    if (e.changedTouches?.length) return e.changedTouches[0].clientX;
    if (typeof e.clientX === 'number') return e.clientX;
    if (e.nativeEvent?.touches?.length) return e.nativeEvent.touches[0].clientX;
    return 0;
  };

  const startDrag = (e) => {
    const el = scrollerRef.current;
    if (!el) return;
    isDown.current = true;
    startX.current = getClientX(e);
    scrollLeft.current = el.scrollLeft;
    el.style.cursor = 'grabbing';

    if (e.pointerId && el.setPointerCapture) {
      try {
        el.setPointerCapture(e.pointerId);
      } catch {}
    }
  };

  const moveDrag = (e) => {
    const el = scrollerRef.current;
    if (!el || !isDown.current) return;
    e.preventDefault?.();
    const x = getClientX(e);
    const walk = x - startX.current;
    el.scrollLeft = scrollLeft.current - walk;
  };

  const endDrag = (e) => {
    const el = scrollerRef.current;
    if (!el) return;
    isDown.current = false;
    el.style.cursor = 'grab';
    if (e.pointerId && el.releasePointerCapture) {
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  return (
    <div
      ref={scrollerRef}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
      onMouseDown={startDrag}
      onMouseMove={moveDrag}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
      onTouchStart={startDrag}
      onTouchMove={moveDrag}
      onTouchEnd={endDrag}
      className="pt-[5px] flex overflow-x-auto no-scrollbar gap-[5px] scroll-smooth snap-x snap-mandatory cursor-grab"
      style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
    >
      {products.map((p, idx) => (
        <div
          key={idx}
          className="w-[60px] h-[70px] lg:w-[90px] lg:h-[110px] 2xl:w-[122.7px] 2xl:h-[169.1px] rounded-[16.81px] flex-shrink-0 snap-start"
        >
          <img
            src={p.src}
            alt={p.alt}
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            className="w-full h-full rounded-[16.81px] object-cover"
          />
        </div>
      ))}
    </div>
  );
};
