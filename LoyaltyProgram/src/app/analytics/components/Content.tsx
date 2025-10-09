"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const MainContent = () => {
  const router = useRouter();

  const [offersCount, setOffersCount] = useState<number | null>(null);
  const [loadingOffers, setLoadingOffers] = useState(true);

  const [mostActiveTier, setMostActiveTier] = useState<string>("–");
  const [loadingTier, setLoadingTier] = useState(true);

  const [pointsIssued, setPointsIssued] = useState<number | null>(null);
  const [loadingPoints, setLoadingPoints] = useState(true);

    const [pointsRedeemed, setPointsRedeemed] = useState<number | null>(null);

  const [redemptionRate, setRedemptionRate] = useState<string>("–");
  const [loadingRedemption, setLoadingRedemption] = useState(true);

  const baseStats = [
    {
      label: "Points Issued",
      value: pointsIssued !== null ? pointsIssued : "–",
      redirect: "/analytics/pointIssued",
    },
    {
      label: "Points Redeemed",
      value: pointsRedeemed !== null ? pointsRedeemed: "–",
    },
    {
      label: "Active Campaigns",
      value: offersCount ?? "–",
    },
    {
      label: "Avg. Redemption Rate",
      value:  redemptionRate ,
    },
    {
      label: "Most Active Tier",
      value: mostActiveTier,
    },
  ];

  useEffect(() => {
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
        if(totalPoints){
        const rate = ((totalPoints / totalPoints) * 100).toFixed(1);
          setRedemptionRate(`${rate}%`);
          console.log("redemption",rate);
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

    fetchOffers();
    fetchMostActiveTier();
    fetchPointsIssued();
  }, []);

  return (
    <div className="flex gap-2 sm:gap-3 p-2 min-w-max">
      {baseStats.map((stat) => {
        const isLoading =
          (stat.label === "Points Issued" && loadingPoints) ||
          (stat.label === "Points Redeemed" && loadingPoints) ||
          (stat.label === "Active Campaigns" && loadingOffers) ||
          (stat.label === "Most Active Tier" && loadingTier) || 
          (stat.label === "Avg. Redemption Rate" && loadingRedemption);;

        return (
          <div
            key={stat.label}
            className="bg-[#E8E6D9] rounded-2xl sm:rounded-[32px]
                       p-3 sm:p-6 shadow-md sm:shadow-lg
                       w-[140px] xs:w-[160px] sm:w-[220px] lg:w-[190px] 2xl:w-[250px]
                       h-[120px] xs:h-[140px] sm:h-[200px] lg:h-[170px] 2xl:h-[200px]
                       flex flex-col flex-shrink-0"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] xs:text-[10px] sm:text-[12px] 2xl:text-[16px] font-semibold text-[#2C2A25]">
                 {stat.label === "Avg. Redemption Rate" ? (
                  <>
                    Avg. Redemption
                    <br /> Rate
                  </>
                ) : (
                  stat.label
                )}
              </p>

              <div
                className="cursor-pointer hover:bg-[#D9D9D9] w-[20px] h-[20px] sm:w-[30px] sm:h-[30px] 2xl:w-[40px] 2xl:h-[40px]
                            rounded-full border border-[#2C2A25] flex items-center justify-center"
                onClick={() => stat.redirect && router.push(stat.redirect)}
              >
                <img
                  src="Arrow1.svg"
                  alt="arrow"
                  className="w-3 h-3 sm:w-4 sm:h-4 2xl:w-6 2xl:h-6"
                />
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center">
              {isLoading ? (
                <div className="w-12 sm:w-16 h-6 sm:h-8 bg-[#d1cfbf] rounded-lg animate-pulse"></div>
              ) : (
                <span className="mt-2 text-[20px] xs:text-[24px] sm:text-[36px] lg:text-[34px] 2xl:text-[38px] font-extrabold text-[#2C2A25]">
                  {stat.value}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MainContent;
