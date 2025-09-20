export const FloatingInput = ({
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  required = true,
  className = "", // ✅ accept className
}: {
  id: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  className?: string; // ✅ allow extra class
}) => (
  <div className="relative w-full">
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={`peer w-full p-3 rounded-full border border-[#D2D1CA] 
                  focus:outline-none focus:ring-2 focus:ring-[#734A00] 
                  placeholder-transparent ${className}`} // ✅ merge className
    />
    <label
      htmlFor={id}
      className="absolute left-4 top-3 text-gray-500 transition-all duration-200
                 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base
                 peer-focus:top-[-8px] peer-focus:text-xs peer-focus:text-[#734A00]
                 peer-valid:top-[-8px] peer-valid:text-xs peer-valid:text-[#734A00]
                 bg-white px-1 rounded pointer-events-none"
    >
      {placeholder}
    </label>
  </div>
);
