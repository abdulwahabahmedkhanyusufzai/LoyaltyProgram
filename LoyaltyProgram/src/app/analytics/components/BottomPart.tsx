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
  loadingTier
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
          />
        ) : activeChart === "pointsRedeemed" ? (
          <PointsRedeemedChart
          pointsRedeemed={pointsRedeemed}
          loadingRedemption={loadingRedemption} />
        ) : activeChart === "ActiveOfferCampign" ? (
           <ActiveOffersChart totalOffers={offerCount} loadingOffers={loadingOffers}/>
        ) :activeChart === "AverageRedeemptionRate" ? (
          <AverageRedemptionRateChart redemptionRate={redemptionRate} loadingRedemption={loadingRedemption}/>
        ):activeChart === "MostActiveTier" ? (
          <MostActiveTierChart mostActiveTier={mostActiveTier} loadingTier={loadingTier}/>
        ):(
          <CustomersUsageChart />
        )}

      </div>

      <div className="flex-[1]">
        <ActiveCustomersCard />
      </div>
    </div>
  );
};

export default BottomPart;
