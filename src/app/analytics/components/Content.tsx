"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const MainContent = ({ pointsIssued, loadingPoints, pointsRedeemed, redemptionRate, loadingRedemption, setActiveChart, offersCount, loadingOffers, mostActiveTier, loadingTier }) => {
  const router = useRouter();
  const t = useTranslations();


  const toggleActiveChart = () => {
    setActiveChart("pointsIssued");
  }
  const toggleActiveChart2 = () => {
    setActiveChart("pointsRedeemed");
  }
  const toggleOfferChart = () => {
    setActiveChart("ActiveOfferCampign");
  }
  const toggleAverageChart = () => {
    setActiveChart("AverageRedeemptionRate");
  }
  const toggleMostActiveTier = () => {
    setActiveChart("MostActiveTier");
  }
  const baseStats = [
    {
      label: t("pointsIssued")
      value: pointsIssued !== null ? pointsIssued : "–",
      onClick: () => toggleActiveChart(),
    },
    {
      label: t("pointsRedeemed"),
      value: pointsRedeemed !== null ? pointsRedeemed : "–",
      onClick: () => toggleActiveChart2(),
    },
    {
      label: t("activeCampaigns"),
      value: offersCount ?? "–",
      onClick: () => toggleOfferChart(),
    },
    {
      label: t("avgRedemptionRate"),
      value: redemptionRate,
      onClick: () => toggleAverageChart(),
    },
    {
      label: t("mostActiveTier"),
      value: mostActiveTier,
      onClick: () => toggleMostActiveTier(),
    },
  ];



  return (
    <div className="flex gap-2 sm:gap-3 p-2 min-w-max">
      {baseStats.map((stat) => {
        const isLoading =
          (stat.label === t("pointsIssued") && loadingPoints) ||
          (stat.label === t("pointsRedeemed") && loadingPoints) ||
          (stat.label === t("activeCampaigns") && loadingOffers) ||
          (stat.label === t("mostActiveTier") && loadingTier) ||
          (stat.label === t("avgRedemptionRate") && loadingRedemption);;

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
                {stat.label === t("avgRedemptionRate") ? (
                  <>
                    {t("avgRedemptionRate").split(" ")[0]}
                    <br /> {t("avgRedemptionRate").split(" ")[1]}
                  </>
                ) : (
                  stat.label
                )}
              </p>

              <div
                className="cursor-pointer hover:bg-[#D9D9D9] w-[20px] h-[20px] sm:w-[30px] sm:h-[30px] 2xl:w-[40px] 2xl:h-[40px]
                            rounded-full border border-[#2C2A25] flex items-center justify-center"
                onClick={stat.onClick}
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
