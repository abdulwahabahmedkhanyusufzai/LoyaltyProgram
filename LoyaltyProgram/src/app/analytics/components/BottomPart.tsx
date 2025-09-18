import { ActiveCustomersCard } from "@/app/components/ActiveCustomersChart"
import { CustomersUsageChart } from "@/app/components/CustomerUsageChart"

const BottomPart = () =>  {
    return(
          <div className="flex flex-col lg:flex-row justify-center items-stretch gap-5 w-full">
             <div className="flex-[2]">
               <CustomersUsageChart />
             </div>
             <div className="flex-[1]">
               <ActiveCustomersCard />
             </div>
             </div>
    )
}

export default BottomPart;