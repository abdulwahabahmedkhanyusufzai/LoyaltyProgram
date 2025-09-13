export const FloatingTextarea = ({
  id,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) => (
  <div className="relative w-full">
    <textarea
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={3}
      className="peer w-full p-3 rounded-full border border-[#D2D1CA] 
                 focus:outline-none focus:ring-2 focus:ring-[#734A00] 
                 placeholder-transparent resize-none"
      required
    />
    <label
      htmlFor={id}
      className="absolute left-4 top-3 text-gray-500 transition-all
                 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base
                 peer-focus:top-[-8px] peer-focus:text-xs peer-focus:text-[#734A00]
                 peer-valid:top-[-8px] peer-valid:text-xs peer-valid:text-[#734A00]
                 bg-white px-1 rounded"
    >
      {placeholder}
    </label>
  </div>
);
