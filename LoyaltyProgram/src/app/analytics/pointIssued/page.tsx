"use client";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
} from "recharts";

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`bg-[#d1cfbf] rounded-lg animate-pulse ${className}`} />
);

export default function PointsDashboard() {
  const [stats, setStats] = useState({
    pointsIssued: 0,
    pointsRedeemed: 0,
    totalMembers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [tierData, setTierData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise((res) => setTimeout(res, 1000));

        setStats({
          pointsIssued: 120000,
          pointsRedeemed: 89000,
          totalMembers: 5400,
        });

        setChartData([
          { month: "Jan", points: 8000 },
          { month: "Feb", points: 10000 },
          { month: "Mar", points: 14000 },
          { month: "Apr", points: 12000 },
          { month: "May", points: 16000 },
          { month: "Jun", points: 20000 },
        ]);

        setTierData([
          { tier: "Bronze", count: 1800 },
          { tier: "Silver", count: 2500 },
          { tier: "Gold", count: 900 },
          { tier: "Platinum", count: 200 },
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const kpiItems = [
    { label: "Points Issued", value: stats.pointsIssued.toLocaleString() },
    { label: "Points Redeemed", value: stats.pointsRedeemed.toLocaleString() },
    { label: "Total Members", value: stats.totalMembers.toLocaleString() },
  ];

  return (
    <div className="min-h-screen bg-[#FEFCED] p-6 sm:p-10 text-[#B47A11]">
      {/* Header */}
      <h1 className="text-3xl font-extrabold mb-8 tracking-tight">
        Points Issued Dashboard
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {kpiItems.map(({ label, value }) => (
          <div
            key={label}
            className="bg-[#E8E6D9] hover:scale-[1.02] transition-transform 
                       rounded-2xl p-6 shadow-md h-[140px] flex flex-col justify-between"
          >
            <p className="text-sm font-semibold">{label}</p>
            {loading ? (
              <Skeleton className="w-24 h-6 mt-3" />
            ) : (
              <p className="text-3xl font-extrabold mt-1">{value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Line Chart */}
        <div className="bg-[#E8E6D9] rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Monthly Points Issued</h2>
          {loading ? (
            <Skeleton className="w-full h-[240px]" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B47A11" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#B47A11" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#c8c6b8" />
                <XAxis dataKey="month" stroke="#B47A11" />
                <YAxis stroke="#B47A11" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="points"
                  stroke="#B47A11"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPoints)"
                  dot={{ r: 5, strokeWidth: 2 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar Chart */}
        <div className="bg-[#E8E6D9] rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Tier Distribution</h2>
          {loading ? (
            <Skeleton className="w-full h-[240px]" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={tierData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#c8c6b8" />
                <XAxis dataKey="tier" stroke="#B47A11" />
                <YAxis stroke="#B47A11" />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="count"
                  fill="#B47A11"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
