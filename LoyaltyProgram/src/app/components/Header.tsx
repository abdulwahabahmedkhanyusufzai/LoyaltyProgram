export const Header = () => {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      {/* Left Side */}
      <div className="flex flex-col">
        <h1 className="text-[28px] sm:text-[35px] lg:text-[45.9px] font-bold text-[#2C2A25]">
          WARO
        </h1>
        <p className="text-[#2C2A25] mt-1 text-sm sm:text-base">
          Welcome to the Loyalty Program.
        </p>
      </div>

      {/* Right Icons */}
      <div className="flex items-center space-x-4 sm:space-x-6">
        <button className="flex items-center justify-center p-2 rounded-full border-[#2C2A25] border w-[45px] h-[45px] sm:w-[50px] sm:h-[50px] lg:w-[58px] lg:h-[58px] hover:bg-gray-200">
          <img
            src="bell-icon.png"
            className="h-5 w-5 sm:h-6 sm:w-6"
            alt="bell"
          />
        </button>
        <button className="p-1 rounded-full hover:ring-2 hover:ring-[#2C2A25]">
          <img
            src="profile.jpg"
            className="h-[45px] w-[45px] sm:h-[50px] sm:w-[50px] lg:h-[58px] lg:w-[58px] object-cover rounded-full"
            alt="profile"
          />
        </button>
      </div>
    </div>
  );
};
