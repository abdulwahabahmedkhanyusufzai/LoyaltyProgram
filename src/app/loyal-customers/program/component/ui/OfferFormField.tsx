"use client";
import { FloatingInput } from "../../../../components/FloatingInput";
import { FloatingTextarea } from "../../../../components/FloatingTextArea";
import StartDatePicker from "../../../../components/StartDate";
import EndDatePicker from "../../../../components/EndDate";
import FloatingOfferTypeDropdown from "../../../../components/OfferTypeDropdown";
import { Offer } from "../../../../models/Offer";
import { OFFER_TYPES } from "../../../../constants/offerTypes";
import OfferTable from "./OfferTable";

interface Props {
  offer: Offer;
  handleChange: (field: string, value: any) => void;
  errors: Record<string, string>;
  loading: boolean;
  handleSubmit: any;
}

const OfferFormFields = ({ offer, handleChange, errors, loading ,handleSubmit}: Props) => {
  const ErrorMsg = ({ field }: { field: string }) =>
    errors[field] ? (
      <p className="text-red-500 text-sm">{errors[field]}</p>
    ) : null;

  const offerTypeFlags = {
    isFixed: offer.offerType === "FIXED_AMOUNT_DISCOUNT",
    isPercentage: offer.offerType === "PERCENTAGE_DISCOUNT",
    isFreeShipping: offer.offerType === "FREE_SHIPPING",
    isFreeGift: offer.offerType === "FREE_GIFT",
  };

  return (
    <div className="md:col-span-2 flex flex-col gap-4">
      <FloatingInput
        id="offerName"
        placeholder="Offer Name"
        value={offer.offerName}
        onChange={(e) => handleChange("offerName", e.target.value)}
      />
      <ErrorMsg field="offerName" />

      <FloatingTextarea
        id="description"
        placeholder="Description"
        value={offer.description}
        onChange={(e) => handleChange("description", e.target.value)}
      />
      <ErrorMsg field="description" />

      {/* ✅ If FIXED_AMOUNT_DISCOUNT, show static prices instead of input */}
      <OfferTable {...offerTypeFlags} offer={offer} />

      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <StartDatePicker
          offer={offer}
          handleChange={(field, value) => handleChange(field, value)}
        />
        <EndDatePicker
          offer={offer}
          handleChange={(field, value) => handleChange(field, value)}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <FloatingOfferTypeDropdown
          offer={offer}
          handleChange={handleChange}
          OFFER_TYPES={OFFER_TYPES}
          ErrorMsg={ErrorMsg}
        />
      </div>

      <button
        disabled={loading}
        type="submit"
        onClick={(e) => handleSubmit(e)}
        className={`cursor-pointer w-full py-3 rounded-full mt-2 text-lg  ${
          loading
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-[#734A00] text-white hover:bg-[#5a3900]"
        }`}
      >
        {loading ? "Saving..." : "Save Offer"}
      </button>
    </div>
  );
};

export default OfferFormFields;
