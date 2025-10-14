const Header = () => {
    return(
        <div className="flex items-start my-[10px] justify-between">
          <div className="flex items-center justify-start mb-0 gap-2">
            <img
              src="PremiumLoyalty.png"
              alt=""
              className="h-[37px] w-[37px]"
            />
            <h2 className="text-xl sm:text-2xl font-bold text-[#2C2A25]">
              Send an Email
            </h2>
          </div>
        </div>
    )
}

export default Header;