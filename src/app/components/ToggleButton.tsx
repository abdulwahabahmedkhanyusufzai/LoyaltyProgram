interface ToggleProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Toggle = ({ label, name, checked, onChange }: ToggleProps) => (
  <label className="flex items-center justify-between cursor-pointer">
    <span className="text-[#734A00] text-sm sm:text-base">{label}</span>
    <div className="relative">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className="w-10 sm:w-11 h-5 sm:h-6 bg-gray-200 peer-checked:bg-[#734A00] rounded-full transition-all"></div>
      <div className="absolute top-0.5 left-0.5 w-4 sm:w-5 h-4 sm:h-5 bg-white rounded-full shadow-md transition-all peer-checked:translate-x-5"></div>
    </div>
  </label>
);
