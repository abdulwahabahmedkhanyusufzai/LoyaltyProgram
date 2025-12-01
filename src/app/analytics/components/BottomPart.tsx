"use client";
import { useState } from "react";
import { ActiveCustomersCard } from "@/app/components/ActiveCustomersChart";
import { CustomersUsageChart } from "@/app/components/CustomerUsageChart";
import { PointsIssuedChart } from "@/app/components/PointsissuedChart";
import { PointsRedeemedChart } from "@/app/components/PointRedeemedChart";
import { ActiveOffersChart } from "@/app/components/ActiveOfferCampagin";
import AverageRedemptionRateChart from "@/app/components/AverageRedemptionRateChart";
import MostActiveTierChart from "@/app/components/mostActiveTier";

const BottomPart = ({
  pointsIssued,
  loadingPoints,
  pointsRedeemed,
  redemptionRate,
  loadingRedemption,
  activeChart,
  offerCount,
  loadingOffers,
  mostActiveTier,
  loadingTier,
  pointsHistory,
  offersHistory,
  activeCustomersHistory,
  tierDistribution,
  customerStatus // New prop
}) => {
  // 👇 Default: "pointsIssued" is active
    console.log("Redemption Rate",redemptionRate);
  return (
    <div className="flex flex-col lg:flex-row justify-center items-stretch gap-5 w-full">
      <div className="flex-[2] flex flex-col">
        {/* Conditional Chart Rendering */}
       {activeChart === "pointsIssued" ? (
          <PointsIssuedChart
            pointsIssued={pointsIssued}
            pointsRedeemed={pointsRedeemed}
            loadingPoints={loadingPoints}
            pointsHistory={pointsHistory}
          />
        ) : activeChart === "pointsRedeemed" ? (
          <PointsRedeemedChart
          pointsRedeemed={pointsRedeemed}
          loadingRedemption={loadingRedemption}
          pointsHistory={pointsHistory}
          />
        ) : activeChart === "ActiveOfferCampign" ? (
           <ActiveOffersChart
            totalOffers={offerCount}
            loadingOffers={loadingOffers}
            offersHistory={offersHistory}
           />
        ) :activeChart === "AverageRedeemptionRate" ? (
          <AverageRedemptionRateChart
            redemptionRate={redemptionRate}
            loadingRedemption={loadingRedemption}
            pointsHistory={pointsHistory}
          />
        ):activeChart === "MostActiveTier" ? (
          <MostActiveTierChart
            mostActiveTier={mostActiveTier}
            loadingTier={loadingTier}
            tierDistribution={tierDistribution}
          />
        ):(
          <CustomersUsageChart
            activeCustomersHistory={activeCustomersHistory}
          />
        )}

      </div>

      <div className="flex-[1]">
        <ActiveCustomersCard customerStatus={customerStatus} />
      </div>
    </div>
  );
};

export default BottomPart;
