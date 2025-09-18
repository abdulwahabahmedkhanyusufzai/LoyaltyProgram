"use client";
import BottomPart from "./components/BottomPart";
import Heading from "./components/Heading";
import MainPart from "./components/MainPart";

const Analytics = () => {

  
  return (
    <div className="p-4 sm:p-7 space-y-6 bg-white min-h-screen ">
      {/* Heading */}
      <Heading/>

      {/* Scrollable stats */}
      <MainPart/>
      <BottomPart/>
    </div>
  );
};

export default Analytics;
