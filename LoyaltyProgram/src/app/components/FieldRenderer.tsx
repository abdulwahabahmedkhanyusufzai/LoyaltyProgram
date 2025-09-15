// components/FieldRenderer.tsx
import { Input } from "./Input";
import { Toggle } from "./ToggleButton";

export const FieldRenderer = ({ fields, toggles, select, form, handleChange }: any) => {
  if (fields) {
    return (
      <div className="space-y-4">
        {fields.map((field: any) => (
          <Input
            key={field.name}
            type={field.type}
            name={field.name}
            label={field.label}
            value={form[field.name]}
            onChange={handleChange}
            error={form.errors?.[field.name]}   // 👈 pass down errors
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
