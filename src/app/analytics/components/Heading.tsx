import { useTranslations } from "next-intl";
const Heading = () => {
  const t = useTranslations("nav");

  return (
    <div className="flex items-center gap-2 sm:gap-3 text-[20px] sm:text-[25px] font-medium">
      <img
        src="/analyticshead.png"
        alt=""
        className="w-6 sm:w-auto h-6 sm:h-auto"
      />
      <h1>{t("analytics")}</h1>
    </div>
  )
};

export default Heading;