"use client";
import { useRef, useEffect } from "react";

interface Props {
  preview: string | null;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors?: string;
}

const OfferImageUploader = ({ preview, handleImageChange, errors }: Props) => {
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 md:col-span-1">
      {preview ? (
        <img
          src={preview}
          alt="Preview"
          className="h-[100px] w-[100px] object-cover rounded-full border"
        />
      ) : (
        <div className="bg-[#D9D9D9] border-[#D2D1CA] text-center rounded-full mt-2 w-[100px] h-[100px] flex items-center justify-center border text-black text-sm">
          Offer Image
        </div>
      )}
      <label
        htmlFor="offerImage"
        className="cursor-pointer bg-[#734A00] text-white py-2 px-6 rounded-full hover:bg-[#5a3900] transition text-sm font-medium"
      >
        Upload Image
      </label>
      <input
        id="offerImage"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />
      {errors && <p className="text-red-500 text-sm">{errors}</p>}
    </div>
  );
};

export default OfferImageUploader;
