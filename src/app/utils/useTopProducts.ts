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
    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/shopify/fetch-products?first=${first}`);
        const data = await res.json();
        setProducts(data.products);
        console.log("Fetched products:", data.products);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [shopId, first]);

  return { products, loading };
}
