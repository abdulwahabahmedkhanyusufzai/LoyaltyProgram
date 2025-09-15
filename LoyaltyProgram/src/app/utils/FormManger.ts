import { CustomerForm } from "../models/CustomForm";

export class FormManager {
  private form: CustomerForm;

  constructor(init?: Partial<CustomerForm>) {
    this.form = new CustomerForm(init);
  }

  getForm() {
    return this.form;
  }

  handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    const fieldValue = type === "checkbox" ? checked : value;
    this.form.updateField(name as keyof CustomerForm, fieldValue);
    return this.form;
  }

  handleImageUpload(file: File) {
    this.form.uploadProfilePic(file);
    return this.form;
  }

  resetForm() {
    this.form = this.form.reset();
    return this.form;
  }

  async submitForm() {
    this.form.validateAll();

    const formData = new FormData();

    // Append all fields except profilePicFile
    Object.entries(this.form.toPayload()).forEach(([key, value]) => {
      if (value != null) formData.append(key, value as any);
    });

    // Append the file if it exists
    if (this.form.profilePicFile) {
      formData.append("profilePic", this.form.profilePicFile);
    }

    const res = await fetch("/api/user/update", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  }
}
