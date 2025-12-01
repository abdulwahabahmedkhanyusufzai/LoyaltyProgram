"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PointsIssuedChartProps {
  pointsIssued: number;
  pointsRedeemed: number;
  loadingPoints: boolean;
  pointsHistory: { week: string; issued: number; redeemed: number }[]; // New prop
}

export const PointsIssuedChart = ({
  pointsIssued,
  pointsRedeemed,
  loadingPoints,
  pointsHistory,
}: PointsIssuedChartProps) => {
  // Use passed history data directly
  const chartData = pointsHistory && pointsHistory.length > 0 ? pointsHistory : [];

  const redemptionRate =
    pointsIssued > 0 ? ((pointsRedeemed / pointsIssued) * 100).toFixed(2) : "0";

  return (
    <div
      className="bg-[#E8E6D9] rounded-xl sm:rounded-[25px] p-3 sm:p-6 shadow-md sm:shadow-lg 
                  w-full h-[280px] sm:h-[350px] lg:h-[450px] 2xl:h-[490px] relative flex flex-col"
    >
      

      {/* Chart */}
      <ResponsiveContainer width="100%" height="100%">
        {loadingPoints ? (
          <div className="flex items-center justify-center w-full h-full">
            <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-[#B07C0D] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 15, left: 25, bottom: 30 }}
          >
            <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
            <XAxis
              dataKey="week"
              tick={{ fill: "#2C2A25", fontSize: 10, fontWeight: 600 }}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: "#2C2A25", fontSize: 10, fontWeight: 600 }}
              axisLine={false}
              label={{
                value: "Points",
                angle: -90,
                position: "insideLeft",
                style: {
                  textAnchor: "middle",
                  fill: "#B07C0D",
                  fontWeight: 700,
                  fontSize: 10,
                },
              }}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="issued"
              stroke="#B07C0D"
              strokeWidth={2}
              dot={{ r: 3, fill: "#B07C0D" }}
              activeDot={{ r: 5 }}
              name="Points Issued"
            />
            <Line
              type="monotone"
              dataKey="redeemed"
              stroke="#2C2A25"
              strokeWidth={2}
              dot={{ r: 3, fill: "#2C2A25" }}
              activeDot={{ r: 5 }}
              name="Points Redeemed"
            />
          </LineChart>
        )}
      </ResponsiveContainer>

      {/* Footer */}
      <div
        className="absolute bottom-1 sm:bottom-2 left-1/2 -translate-x-1/2 
                    text-[10px] sm:text-[12px] 2xl:text-[14px] font-bold text-[#B07C0D]"
      >
        Redemption Rate: {redemptionRate}%
      </div>
    </div>
  );
};
