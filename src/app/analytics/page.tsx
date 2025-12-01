"use client";

import { useEffect, useState, useCallback } from "react";
import BottomPart from "./components/BottomPart";
import Heading from "./components/Heading";
import MainPart from "./components/MainPart";

// Define types for API responses
interface PointsResponse {
  id: string;
  loyaltyPoints: number;
}

interface OffersResponse {
  offers: any[];
}

// Custom hook for fetching analytics data
function useAnalyticsData() {
  const [data, setData] = useState({
    offersCount: 0,
    pointsIssued: 0,
    pointsRedeemed: 0,
    redemptionRate: "–",
    mostActiveTier: "–",
    pointsHistory: [],
  });

  const [loading, setLoading] = useState({
    offers: true,
    points: true,
    redemption: true,
    tier: true,
  });

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading({ offers: true, points: true, redemption: true, tier: true });

      // Fetch all data in parallel
      const [offersRes, pointsRes, tierRes, historyRes] = await Promise.all([
        fetch("/api/offers"),
        fetch("/api/customers/points"),
        fetch("/api/customers/most-active-tier"),
        fetch("/api/analytics/points-history"),
      ]);

      const offersData: OffersResponse = await offersRes.json();
      const pointsData: PointsResponse[] = await pointsRes.json();
      const tierData = await tierRes.json();
      const historyData = await historyRes.json();

      // Compute points and redemption rate
      const totalPoints = pointsData.reduce(
        (sum, p) => sum + (p.loyaltyPoints || 0),
        0
      );

      setData({
        offersCount: offersData?.offers?.length || 0,
        pointsIssued: totalPoints,
        pointsRedeemed: totalPoints, // This might still be total, but graph uses history
        redemptionRate: totalPoints ? "100%" : "0%",
        mostActiveTier: tierData?.mostActiveTier || "–",
        pointsHistory: historyData || [], // Store history
      });
    } catch (err) {
      console.error("❌ Error fetching analytics data:", err);
      setData({
        offersCount: 0,
        pointsIssued: 0,
        pointsRedeemed: 0,
        redemptionRate: "–",
        mostActiveTier: "–",
        pointsHistory: [],
      });
    } finally {
      setLoading({
        offers: false,
        points: false,
        redemption: false,
        tier: false,
      });
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { data, loading, fetchAnalytics };
}

const Analytics = () => {
  const { data, loading } = useAnalyticsData();
  console.log(data);
  const [activeChart, setActiveChart] = useState<
    | "pointsIssued"
    | "customersUsage"
    | "pointsRedeemed"
    | "ActiveOfferCampign"
    | "AverageRedeemptionRate"
    | "MostActiveTier"
  >("customersUsage");

  return (
    <div className="p-4 sm:p-7 space-y-6 bg-white min-h-screen">
      {/* Heading */} 
      <Heading />
      {/* Scrollable stats */}
      <MainPart
        setActiveChart={setActiveChart}
        pointsIssued={data.pointsIssued}
        loadingPoints={loading.points}
        pointsRedeemed={data.pointsRedeemed}
        redemptionRate={data.redemptionRate}
        loadingRedemption={loading.redemption}
        offersCount={data.offersCount}
        loadingOffers={loading.offers}
        mostActiveTier={data.mostActiveTier}
        loadingTier={loading.tier}
      />
      <BottomPart
        activeChart={activeChart}
        pointsIssued={data.pointsIssued}
        loadingPoints={loading.points}
        pointsRedeemed={data.pointsRedeemed}
        redemptionRate={data.redemptionRate}
        loadingRedemption={loading.redemption}
        offerCount={data.offersCount}
        loadingOffers={loading.offers}
        mostActiveTier={data.mostActiveTier}
        loadingTier={loading.tier}
        pointsHistory={data.pointsHistory}
      />
    </div>
  );
};

export default Analytics;
