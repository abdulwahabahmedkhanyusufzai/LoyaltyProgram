// Reusable item component
const CustomerItem = ({ src, name, email }: { src: string; name: string; email: string }) => (
  <div className="flex items-center gap-5 xl:gap-8">
    <button className="md:p-1 rounded-full hover:ring-2 hover:ring-[#2C2A25] transition">
      <img
        src={src}
        alt={name}
        className=" h-[20px] w-[20px] 2xl:h-[60px] 2xl:w-[60px] lg:h-[35px] lg:w-[35px] object-cover rounded-full"
      />
    </button>
    <div className="flex flex-col items-start justify-center">
      <h1 className="text-[8px] 2xl:text-[14px] lg:text-[12px] font-semibold text-[#2C2A25]">
        {name}
      </h1>
      <p className="text-[7px] lg:text-[11px] 2xl:text-[13px] text-[#757575]">{email}</p>
    </div>
  </div>
);

export const LoyalCustomer = () => {
  const customers = [
    { src: "profile.jpg", name: "Emily Mark", email: "Emilymark@mail.com" },
    { src: "christopher.jpg", name: "Christopher", email: "Christopher@mail.com" },
    { src: "zeyanda.jpg", name: "Zeyenda", email: "Zeyenda@mail.com" },
  ];

  return (
    <div className="flex flex-col divide-y w-full divide-[#D2D1CA]">
      {customers.map((customer, index) => (
        <CustomerItem key={index} {...customer} />
      ))}
    </div>
  );
};
