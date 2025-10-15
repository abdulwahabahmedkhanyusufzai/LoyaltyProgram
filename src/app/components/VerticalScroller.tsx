"use client";

import { useTopProducts } from "../utils/useTopProducts";
import { SkeletonProduct } from "./SkeltonOfferFetching";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// 🧠 Helper: Fill missing days with 0-count to keep chart continuous
const generateContinuousData = (purchaseDates: string[]) => {
  if (!purchaseDates?.length) return [];

  // Sort dates
  const sortedDates = purchaseDates
    .map((d) => new Date(d))
    .sort((a, b) => a.getTime() - b.getTime());

  const start = sortedDates[0];
  const end = sortedDates[sortedDates.length - 1];
  const dailyData: Record<string, number> = {};

  // Initialize every day between start and end
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    dailyData[key] = 0;
  }

  // Add counts
  purchaseDates.forEach((date) => {
    const day = new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    dailyData[day] = (dailyData[day] || 0) + 1;
  });

  return Object.entries(dailyData).map(([day, count]) => ({ day, count }));
};

export const TopSellingProductsVertical = () => {
  const { products, loading } = useTopProducts(2, 10);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {loading
        ? Array.from({ length: 4 }).map((_, idx) => (
            <SkeletonProduct key={idx} variant="vertical" />
          ))
        : products.map((p) => {
            const img = p.featuredImage;
            const chartData = generateContinuousData(p.purchaseDates || []);

            return (
              <div
                key={p.id}
                className="flex flex-col items-center text-center rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300 bg-white border border-gray-100"
              >
                {/* Product Section */}
                <div className="w-full flex flex-col items-center">
                  <div className="w-[220px] h-[260px] rounded-2xl overflow-hidden bg-gray-50 relative">
                    {img ? (
                      <img
                        src={img.url}
                        alt={img.altText || p.title}
                        draggable={false}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        No image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>

                  <p className="mt-3 text-lg font-semibold text-gray-900">
                    {p.title}
                  </p>

                  <p className="text-sm text-gray-600">
                    🛒 {p.count} total purchases
                  </p>
                </div>

                {/* Chart Section */}
                {chartData.length > 0 ? (
                  <div className="w-full h-64 mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <defs>
                          <linearGradient
                            id="lineGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#734A00"
                              stopOpacity={0.4}
                            />
                            <stop
                              offset="100%"
                              stopColor="#734A00"
                              stopOpacity={0.05}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#f2f2f2"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="day"
                          tick={{ fontSize: 12, fill: "#555" }}
                          tickMargin={8}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 12, fill: "#555" }}
                          tickMargin={8}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #eee",
                            borderRadius: "8px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                            fontSize: "13px",
                          }}
                          cursor={{ stroke: "#ddd", strokeWidth: 1 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="url(#lineGradient)"
                          strokeWidth={3}
                          dot={{ r: 3, fill: "#734A00" }}
                          activeDot={{ r: 6, fill: "#734A00" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 mt-4">
                    No analytics data available
                  </p>
                )}
              </div>
            );
          })}
    </div>
  );
};
