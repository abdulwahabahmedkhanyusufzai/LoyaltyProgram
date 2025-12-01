import { CustomerForm } from "../models/CustomForm";

export class FormManager {
  private form: CustomerForm;

  constructor(init?: Partial<CustomerForm>) {
    this.form = new CustomerForm(init);
  }

  getForm() {
    return this.form;
  }

  setFormValues(values: Partial<CustomerForm>) {
  Object.entries(values).forEach(([key, value]) => {
    this.form.updateField(key as keyof CustomerForm, value);
  });
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

  async submitProfile() {
    this.form.validateAll(); // You might want to validate only profile fields here

    const formData = new FormData();
    const payload = this.form.toPayload();

    // Append profile fields
    if (payload.fullName) formData.append("fullName", payload.fullName);
    if (payload.email) formData.append("email", payload.email);
    if (payload.phone) formData.append("phone", payload.phone);
    if (payload.password) formData.append("password", payload.password);
    
    // Append the file if it exists
    if (this.form.profilePicFile) {
      formData.append("profilePic", this.form.profilePicFile);
    }

    const res = await fetch("/api/user/update-profile", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  }

  async submitNotifications(notifications: any) {
    // notifications object is passed from the component state because it's not in CustomerForm
    const payload = {
        email: this.form.email, // Needed to identify user
        language: this.form.language,
        notifications: notifications 
    };

    const res = await fetch("/api/user/update-notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  }
}

