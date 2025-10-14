"use client";
import { useEffect, useState } from "react";
import BottomPart from "./components/BottomPart";
import Heading from "./components/Heading";
import MainPart from "./components/MainPart";

const Analytics = () => {
  const [offersCount, setOffersCount] = useState<number | null>(null);
  const [loadingOffers, setLoadingOffers] = useState(true);

  const [pointsIssued, setPointsIssued] = useState<number | null>(null);
  const [loadingPoints, setLoadingPoints] = useState(true);

  const [pointsRedeemed, setPointsRedeemed] = useState<number | null>(null);

  const [redemptionRate, setRedemptionRate] = useState<string>("–");
  const [loadingRedemption, setLoadingRedemption] = useState(true);

  const [activeChart, setActiveChart] = useState<
    "pointsIssued" | "customersUsage" | "pointsRedeemed" | "ActiveOfferCampign" | "AverageRedeemptionRate" | "MostActiveTier">("customersUsage");

      const [mostActiveTier, setMostActiveTier] = useState<string>("–");
  const [loadingTier, setLoadingTier] = useState(true);

  useEffect(() => {
     const fetchMostActiveTier = async () => {
      try {
        setLoadingTier(true);
        const res = await fetch("/api/customers/most-active-tier");
        const data = await res.json();
        setMostActiveTier(data?.mostActiveTier || "–");
      } catch (err) {
        console.error("❌ Error fetching most active tier:", err);
        setMostActiveTier("–");
      } finally {
        setLoadingTier(false);
      }
    };
    const fetchPointsIssued = async () => {
      try {
        setLoadingPoints(true);
        const res = await fetch("/api/customers/points");
        const data: { id: string; loyaltyPoints: number }[] = await res.json();
        const totalPoints = data.reduce(
          (sum, p) => sum + (p.loyaltyPoints || 0),
          0
        );
        setPointsIssued(totalPoints);
        setPointsRedeemed(totalPoints);
        if (totalPoints) {
          const rate = ((totalPoints / totalPoints) * 100).toFixed(1);
          setRedemptionRate(`${rate}%`);
          console.log("redemption", rate);
        } else {
          setRedemptionRate("0%");
        }
      } catch (err) {
        console.error("❌ Error fetching points issued:", err);
        setPointsIssued(0);
        setPointsIssued(0);
        setPointsRedeemed(0);
        setRedemptionRate("–");
      } finally {
        setLoadingPoints(false);
        setLoadingRedemption(false);
      }
    };
   const fetchOffers = async () => {
      try {
        setLoadingOffers(true);
        const res = await fetch("/api/offers");
        const data = await res.json();
        setOffersCount(data?.offers?.length || 0);
      } catch (err) {
        console.error("❌ Error fetching offers:", err);
        setOffersCount(0);
      } finally {
        setLoadingOffers(false);
      }
    };
    fetchOffers()
    fetchPointsIssued();
    fetchMostActiveTier();
  }, []);
  return (
    <div className="p-4 sm:p-7 space-y-6 bg-white min-h-screen ">
      {/* Heading */}
      <Heading />

      {/* Scrollable stats */}
      <MainPart
        setActiveChart={setActiveChart}
        pointsIssued={pointsIssued}
        loadingPoints={loadingPoints}
        pointsRedeemed={pointsRedeemed}
        redemptionRate={redemptionRate}
        loadingRedemption={loadingRedemption}
        offersCount ={offersCount}
        loadingOffers = {loadingOffers}
        mostActiveTier = {mostActiveTier}
        loadingTier = {loadingTier}
      />
      <BottomPart
        activeChart={activeChart}
        pointsIssued={pointsIssued}
        loadingPoints={loadingPoints}
        pointsRedeemed={pointsRedeemed}
        redemptionRate={redemptionRate}
        loadingRedemption={loadingRedemption}
        offerCount = {offersCount}
        loadingOffers = {loadingOffers}
           mostActiveTier = {mostActiveTier}
        loadingTier = {loadingTier}
      />
    </div>
  );
};

export default Analytics;
