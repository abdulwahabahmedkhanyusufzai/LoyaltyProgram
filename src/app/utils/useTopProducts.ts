"use client";

import { useEffect, useState } from "react";

type ProductNode = {
  id: string;
  title: string;
  featuredImage: {
    url: string;
    altText: string | null;
  };
  purchaseDates?: string[];
  count?: number;
};

export function useTopProducts(shopId: number, first: number) {
  const [products, setProducts] = useState<ProductNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // ✅ avoid state updates if component unmounted

    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/shopify/fetch-products?first=${first}`);
        if (!res.ok) {
          console.warn("⚠️ Products API responded with status:", res.status);
          return setProducts([]); // fallback to empty
        }

        const data = await res.json();
        if (isMounted) setProducts(Array.isArray(data?.products) ? data.products : []);
        console.log("Fetched products:", data?.products || []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        if (isMounted) setProducts([]); // fallback to empty
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isMounted = false; // cleanup
    };
  }, [shopId, first]);

  return { products, loading };
}
