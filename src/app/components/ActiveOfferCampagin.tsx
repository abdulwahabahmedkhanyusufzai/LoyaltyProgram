"use client";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useEffect, useState } from "react";

export const ActiveOffersChart = ({ totalOffers, loadingOffers }) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (!loadingOffers) {
      // Simulated active offer trend across months
      const generatedData = [
        { name: "Jan", active: Math.floor(totalOffers * 0.4) },
        { name: "Feb", active: Math.floor(totalOffers * 0.5) },
        { name: "Mar", active: Math.floor(totalOffers * 0.6) },
        { name: "Apr", active: Math.floor(totalOffers * 0.7) },
        { name: "May", active: Math.floor(totalOffers * 0.65) },
        { name: "Jun", active: Math.floor(totalOffers * 0.75) },
      ];
      setData(generatedData);
    }
  }, [totalOffers, loadingOffers]);

  return (
    <div className="bg-[#E8E6D9] p-4 rounded-2xl shadow-md w-full h-[400px] flex flex-col">
      <h2 className="text-lg font-bold mb-4 text-gray-900">
        Active Offers Overview
      </h2>

      {loadingOffers ? (
        <div className="flex items-center justify-center flex-1">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center flex-1 text-gray-500">
          No active offer data available.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip
              contentStyle={{
                background: "#ffffff",
                borderRadius: "10px",
                border: "1px solid #e5e5e5",
              }}
            />
            <Line
              type="monotone"
              dataKey="active"
              stroke="#734A00"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
