import { useState } from "react";

const HomeSection = ({setStep,setSelectedTab}) => {
    const [selectedOption, setSelectedOption] = useState("hosts");
    const radioOptions = [
        "hosts",
        "guests",
        "welcomed",
        "A particular person",
        "test",
        "all",
      ];
    return(
           <>
            <div className="flex justify-center font-bold text-center text-lg sm:text-xl">
              Sending a targeted Email
            </div>

            <div className="flex items-center justify-center my-6">
              <h1 className="text-xl sm:text-2xl font-bold text-[#2C2A25]">
                Choose the recipient group
              </h1>
            </div>

            <div className="my-10 flex flex-wrap justify-center gap-6 mb-6">
              {radioOptions.map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="recipient"
                    value={option}
                    checked={selectedOption === option}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="accent-[#6a4e1e] w-4 h-4"
                  />
                  <span className="text-gray-700 capitalize">{option}</span>
                </label>
              ))}
            </div>

            <div className="my-10 flex justify-center">
              <button
                onClick={() => {setStep(2);
                   setSelectedTab("Send an Email");
                }}
                className="w-full sm:w-[474px] px-8 py-2 rounded-full bg-[#6a4e1e] text-white font-medium shadow-md hover:bg-[#5a3f19] transition"
              >
                Next
              </button>
            </div>
          </>
    )
}

export default HomeSection;