"use client";

import { useTopProducts } from "../utils/useTopProducts";
import { SkeletonProduct } from "./SkeltonOfferFetching";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export const TopSellingProductsVertical = () => {
  const { products, loading } = useTopProducts(2, 10);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {loading
        ? Array.from({ length: 4 }).map((_, idx) => (
            <SkeletonProduct key={idx} variant="vertical" />
          ))
        : products.map((p) => {
            const img = p.featuredImage;

            // 🔹 Group purchaseDates into daily counts
            const dailyData: Record<string, number> = {};
            (p.purchaseDates || []).forEach((date: string) => {
              const day = new Date(date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              dailyData[day] = (dailyData[day] || 0) + 1;
            });

            const chartData = Object.entries(dailyData).map(([day, count]) => ({
              day,
              count,
            }));

            return (
              <div
                key={p.id}
                className="flex flex-col items-center text-center rounded-xl p-4 shadow-md hover:shadow-lg transition bg-white"
              >
                {/* Image + Title + Buyers */}
                <div className="w-full flex flex-col items-center">
                  <div className="w-[200px] h-[260px] rounded-[16.81px] overflow-hidden bg-gray-800">
                    {img ? (
                      <img
                        src={img.url}
                        alt={img.altText || p.title}
                        draggable={false}
                        className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  <p className="mt-2 text-base font-semibold text-black">
                    {p.title}
                  </p>

                  <p className="text-sm text-gray-600">
                    🛒 {p.count} total purchases
                  </p>
                </div>

                {/* Detailed Graph */}
                {chartData.length > 0 && (
                  <div className="w-full h-64 mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="day" />
                        <YAxis allowDecimals={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                          cursor={{ fill: "rgba(0,0,0,0.05)" }}
                        />
                        <Bar
                          dataKey="count"
                          fill="#734A00"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            );
          })}
    </div>
  );
};
