// components/Input.tsx
type InputProps = {
  type: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
};
export const Input = ({ label, type, name, value, onChange ,error}: InputProps) => (
  <div className="flex flex-col">
  <input
    type={type}
    name={name}
    placeholder={label}
    value={value}
    onChange={onChange}
    className={`${error ? "border-red-500 bg-red-50" : "border-gray-300"} text-[#734A00] placeholder-[#734A00] w-full border border-gray-300 rounded-full px-4 py-3 outline-none`}
  />
  {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
  </div>
);



