'use client';

import React, { useEffect, useRef, useState } from 'react';

type ProductNode = {
  id: string;
  title: string;
  images: {
    edges: { node: { id: string; originalSrc: string; altText?: string | null } }[];
  };
};

export const TopSellingProducts = () => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const [products, setProducts] = useState<ProductNode[]>([]);
  const [loading, setLoading] = useState(true);

  // 👇 Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/shopify/fetch-products?shopId=2&first=10');
        const data = await res.json();
        console.log(data.edges.map((edge) => edge.node.images));
        setProducts(data?.edges?.map((edge) => edge.node) || []);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

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

  // 🔄 Show loader while fetching
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

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
      {products.map((p) => {
        const img = p.images.edges[0]?.node;
        return (
          <div
            key={p.id}
            className="w-[60px] h-[90px] lg:w-[90px] lg:h-[110px] 2xl:w-[122.7px] 2xl:h-[169.1px] rounded-[16.81px] flex-shrink-0 snap-start"
          >
            {img ? (
              <img
                src={img.url}
                alt={img.altText || p.title}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                className="w-full h-full rounded-[16.81px] object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-[16.81px] text-xs text-gray-500">
                No image
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
