import { LotaltyProgramCustomers } from "../data/customData";
// Reusable item component
const CustomerItem = ({ src, name, email }: { src: string; name: string; email: string }) => (
  <div className="flex items-center gap-5 xl:gap-8">
     <button
                className="rounded-full min-w-[50px] aspect-square bg-center bg-cover bg-no-repeat"
                style={{ backgroundImage: `url(/${src})` }}
              /> 
    <div className="flex flex-col items-start justify-center">
      <h1 className="text-[10px] 2xl:text-[14px] lg:text-[12px] font-semibold text-[#2C2A25]">
        {name}
      </h1>
      <p className="text-[10px] lg:text-[11px] 2xl:text-[13px] text-[#757575]">{email}</p>
    </div>
  </div>
);

export const LoyalCustomer = () => {
  

  return (
    <div className="flex flex-col divide-y w-full divide-[#D2D1CA]">
      {LotaltyProgramCustomers.map((customer, index) => (
        <CustomerItem key={index} {...customer} />
      ))}
    </div>
  );
};
