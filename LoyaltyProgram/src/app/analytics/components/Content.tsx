import { useEffect, useState } from "react";

const MainContent = () => {
  const [offersCount, setOffersCount] = useState<number | null>(null);
  const [loadingOffers, setLoadingOffers] = useState(true);

  const [mostActiveTier, setMostActiveTier] = useState<string>("–");
  const [loadingTier, setLoadingTier] = useState(true);

  const baseStats = [
    { label: "Points Issued", value: "25K+" },
    { label: "Points Redeemed", value: "35K+" },
    { label: "Active Campaigns", value: "" }, // dynamic
    { label: "Avg. Redemption Rate", value: "16.6+" },
    { label: "Most Active Tier", value: "" }, // dynamic
  ];

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoadingOffers(true);
        const res = await fetch("/api/offers");
        const data = await res.json();
        const activeCount = data?.offers?.length || 0;
        setOffersCount(activeCount);
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

    fetchOffers();
    fetchMostActiveTier();
  }, []);

  return (
    <div className="flex gap-2 sm:gap-6 min-w-max">
      {baseStats.map((stat) => {
        let displayValue = stat.value;

        if (stat.label === "Active Campaigns") {
          if (!loadingOffers) {
            displayValue = offersCount?.toString() || "0";
          }
        }

        if (stat.label === "Most Active Tier") {
          if (!loadingTier) {
            displayValue = mostActiveTier;
          }
        }

        return (
          <div
            key={stat.label}
            className="bg-[#E8E6D9] rounded-2xl sm:rounded-[32px] 
                       p-3 sm:p-6 shadow-md sm:shadow-lg 
                       w-[140px] xs:w-[160px] sm:w-[220px] lg:w-[180px] 2xl:w-[250px] 
                       h-[120px] xs:h-[140px] sm:h-[200px] lg:h-[170px] 2xl:h-[200px] 
                       flex flex-col flex-shrink-0"
          >
            {/* Header with label + arrow */}
            <div className="flex items-center justify-between">
              <p className="text-[11px] xs:text-[10px] sm:text-[12px] 2xl:text-[16px] font-semibold text-[#2C2A25]">
                {stat.label}
              </p>
              <div className="w-[20px] h-[20px] sm:w-[30px] sm:h-[30px] 2xl:w-[40px] 2xl:h-[40px] 
                              rounded-full border border-[#2C2A25] flex items-center justify-center">
                <img
                  src="arrow.png"
                  alt="arrow"
                  className="w-3 h-3 sm:w-4 sm:h-4 2xl:w-6 2xl:h-6"
                />
              </div>
            </div>

            {/* Stat value */}
            <div className="flex-1 flex items-center justify-center">
              {(stat.label === "Active Campaigns" && loadingOffers) ||
              (stat.label === "Most Active Tier" && loadingTier) ? (
                <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-[#2C2A25] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="mt-2 text-[20px] xs:text-[24px] sm:text-[36px] lg:text-[34px] 2xl:text-[38px] font-extrabold text-[#2C2A25]">
                  {displayValue}
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
