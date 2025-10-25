"use client";
import {FloatingInput} from "../../../../components/FloatingInput";
import {FloatingTextarea} from "../../../../components/FloatingTextArea";
import StartDatePicker from "../../../../components/StartDate";
import EndDatePicker from "../../../../components/EndDate";
import FloatingDropdown from "../../../../components/FloatingDropdown";
import FloatingOfferTypeDropdown from "../../../../components/OfferTypeDropdown";
import { Offer, OFFER_TYPES, TIER_OPTIONS } from "../../../../models/Offer";

interface Props {
  offer: Offer;
  handleChange: (field: keyof Offer, value: any) => void;
  errors: Record<string, string>;
  getPointsPlaceholder: () => string;
}

const OfferFormFields = ({ offer, handleChange, errors, getPointsPlaceholder,loading }: Props) => {
  const ErrorMsg = ({ field }: { field: string }) =>
    errors[field] ? <p className="text-red-500 text-sm">{errors[field]}</p> : null;

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

      <FloatingInput
        id="points"
        placeholder={getPointsPlaceholder()}
        value={offer.points !== undefined && offer.points !== null ? String(offer.points) : ""}
        onChange={(e) => handleChange("points", e.target.value)}
      />
      <ErrorMsg field="points" />

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
        <FloatingDropdown
          offer={offer}
          handleChange={handleChange}
          TIER_OPTIONS={TIER_OPTIONS}
          ErrorMsg={ErrorMsg}
        />
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
            className={`cursor-pointer w-full py-3 rounded-full mt-2 text-lg  ${
              loading ? "bg-gray-400 text-white cursor-not-allowed" : "bg-[#734A00] text-white hover:bg-[#5a3900]"
            }`}
          >
            {loading ? "Saving..." : "Save Offer"}
          </button>
    </div>
  );
};

export default OfferFormFields;
