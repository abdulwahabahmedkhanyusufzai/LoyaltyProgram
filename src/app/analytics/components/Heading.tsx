const Heading = () => {
    return(
        <div className="flex items-center gap-2 sm:gap-3 text-[20px] sm:text-[25px] font-medium">
        <img
          src="/analyticshead.png"
          alt=""
          className="w-6 sm:w-auto h-6 sm:h-auto"
        />
        <h1>Analytics</h1>
      </div>
    )
};

export default Heading;