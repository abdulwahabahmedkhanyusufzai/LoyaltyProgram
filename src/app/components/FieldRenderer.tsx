// components/FieldRenderer.tsx
import { FloatingInput } from "./FloatingInput";
import { Toggle } from "./ToggleButton";


export const FieldRenderer = ({ fields, toggles, select, form, handleChange }: any) => {
  console.log(fields);
  if (fields) {
    return (
      <div className="space-y-6"> {/* Added more space for floating labels */}
        {fields.map((field: any) => (
          //  swapped <Input /> for <FloatingInput />
          <FloatingInput
            key={field.label}
            id={field.name} // FloatingInput needs an 'id' for the label's 'htmlFor'
            type={field.type}
            placeholder={field.label} // Map the 'label' from your config to 'placeholder'
            value={form[field.name]}
            onChange={handleChange}
            // We need to handle errors. See Step 2 below.
          />
        ))}
      </div>
    );
  }

 if (toggles) {
    return (
      <div className="space-y-3">
        {toggles.map((item: any) => (
          <Toggle
            key={item.name}
            label={item.label}
            name={item.name}
            checked={form.notifications[item.name]}
            onChange={handleChange}
          />
        ))}
      </div>
    );
  }

  if (select) {
    return (
      <select
        name={select.name}
        value={form[select.name]}
        onChange={handleChange}
        className={`w-full border rounded-full px-4 py-3 text-sm sm:text-base ${
          form.errors?.[select.name] ? "border-red-500 bg-red-50" : "border-gray-300"
        }`}
      >
        {select.options.map((opt: string) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    );
  }
  return null;
};
