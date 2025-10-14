// components/SkeletonProduct.tsx
export const SkeletonProduct = ({ variant = "horizontal" }: { variant?: "horizontal" | "vertical" }) => {
  const sizes =
    variant === "horizontal"
      ? "w-[60px] h-[90px] lg:w-[90px] lg:h-[110px] 2xl:w-[122.7px] 2xl:h-[169.1px] "
      : "w-[200px] h-[260px] lg:w-[240px] lg:h-[300px]";

  return (
    <div
      className={`${sizes} rounded-[16.81px] bg-gray-700/50 flex-shrink-0 snap-start   animate-pulse`}
    />
  );
};
