// components/FieldRenderer.tsx
import { FloatingInput } from "./FloatingInput";
import { Toggle } from "./ToggleButton";
import { useNavData } from "../data/customData";
import { Section } from "./SectionWrapper";
import { ProfilePicUploader } from "./ProfilePicture";
import { LoadingButton } from "./LoadingButton";
import toast from "react-hot-toast";
import { FormManager } from "../utils/FormManger";
import { useTranslations } from "next-intl";

export const FieldRenderer = ({
  form,
  setFormData,
  formManager,
  loading,
  setLoading
}: any) => {
  const t = useTranslations("formSections");
  const { formSections } = useNavData(t);
  const select = formSections.preferences.select;
  const personal = formSections.personal.fields;
  const fields = formSections.security.fields;
  const toggles = formSections.notifications.toggles;
  console.log("fields", fields)
  console.log("personal", personal)
  console.log("toggles", toggles)
  console.log(t("navigation.formSections.fullName"));
  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await formManager.submitProfile();
      toast.success("✅ Profile & Password saved successfully!");
      // Optional: Reset password fields only? Or keep form as is.
    } catch (err: any) {
      toast.error(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Pass the current notifications state to the manager
      await formManager.submitNotifications(form.notifications);
      toast.success("✅ Notifications & Preferences saved successfully!");
    } catch (err: any) {
      toast.error(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    formManager.resetForm();
    setFormData({
      profilePicPreview: "",
      fullName: "",
      email: "",
      phone: "",
      currentPassword: "",
      tier: "",
      points: "",
      expiry: "",
      notifications: {
        systemAlerts: false,
        notifications: false,
        weeklyReports: false,
      },
      language: "English",
    });
  };

  // handleRegister is deprecated/removed in favor of specific handlers
  // keeping handleCancel for reset functionality

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const { name, value, type } = target;

    // ✅ Type guard: only HTMLInputElement has 'checked'
    const fieldValue =
      type === "checkbox" && "checked" in target ? target.checked : value;

    // ✅ Call only if formManager.handleChange exists
    formManager?.handleChange?.(e);

    // ✅ Always update local form state
    setFormData((prev: any) => ({
      ...prev,
      [name]: fieldValue,
    }));
  };

  console.log("form", form);
  return (
    <>
    <form
        onSubmit={handleSecuritySubmit} // 💡 Use the new handler
        className="space-y-6 mb-10" // Add some spacing for separation
      >
      
        {/* ✅ Personal Info Section */}
        {personal && (
          <Personal
            form={form}
            handleChange={handleChange}
            setFormData={setFormData}
            formManager={formManager}
          />
        )}

        {/* ✅ Security Fields */}
        {fields && (
          <Section title={formSections.security.title}>
            <div className="space-y-6">
              {fields.map((field: any) => (
                <FloatingInput
                  key={field.label}
                  id={field.name}
                  type={field.type}
                  placeholder={field.label}
                  value={form[field.name] || ""}
                  onChange={handleChange}
                  name={field.name}

                />
              ))}

            </div>
          </Section>
        )}
        <LoadingButton loading={loading} type="submit">
          Save Password
        </LoadingButton>
         
         </form>

         <form onSubmit={handleGeneralSubmit} className="space-y-6">
          
        {/* ✅ Notification Toggles */}
        {toggles && <Toggled form={form} handleChange={handleChange} />}

        {/* ✅ Preferences Select */}
        {select && <Select form={form} handleChange={handleChange} />}

        {/* ✅ Action Buttons */}
        <div className="mt-6 space-y-3">
          <button
            type="submit"
            className="w-full bg-[#734A00] text-white py-3 rounded-full font-semibold hover:bg-[#5a3800] transition"
          >
            Save Changes
          </button>
          <button
            onClick={handleCancel}
            className="w-full bg-gray-300 text-gray-800 py-3 rounded-full font-semibold hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      
    </form>
    </>
  );
};

export const Select = ({ form, handleChange }: any) => {
  const t = useTranslations("formSections");
  const { formSections } = useNavData(t);
  const select = formSections.preferences.select;

  return (
    <Section title={formSections.preferences.title}>
      <select
        name={select.name}
        value={form[select.name] || ""}
        onChange={handleChange}
        className={`w-full border rounded-full px-4 py-3 text-sm sm:text-base ${form.errors?.[select.name]
          ? "border-red-500 bg-red-50"
          : "border-gray-300"
          }`}
      >
        {select.options.map((opt: string) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </Section>
  );
};

export const Toggled = ({ form, handleChange }: any) => {
  const t = useTranslations("formSections");
  const { formSections } = useNavData(t);
  const toggles = formSections.notifications.toggles;
  return (
    <div className="space-y-3">
      <Section title={formSections.notifications.title}>
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
      </Section>
    </div>
  );
};

export const Personal = ({ form, handleChange, setFormData, formManager }: any) => {
  const t = useTranslations("formSections");
  const { formSections } = useNavData(t);

  const personal = formSections.personal.fields;
  console.log("personal name", personal.map((item: any) => (item.name)));

  return (
    <Section title={formSections.personal.title}>
      <div className="flex flex-col sm:flex-row gap-6 items-start">


        <div className="w-full space-y-4">
          {personal.map((item: any) => (
            <FloatingInput
              key={item.name}
              id={item.name}
              type={item.type}
              placeholder={item.label}
              value={form[item.name] || ""}
              onChange={handleChange}
              name={item.name}
            />
          ))}
        </div>
        <ProfilePicUploader
          profilePic={form.profilePicPreview}
          setFormData={setFormData}
          formManager={formManager}
        />
      </div>

    </Section>
  );
};
