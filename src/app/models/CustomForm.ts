export class CustomerForm {
  fullName = "";
  email = "";
  phone = "";
  currentPassword = "";
  password = "";
  confirmPassword = "";
  confirmNewPassword = "";
  profilePicFile: File | null = null;       // actual File
  profilePicPreview: string = "";
  language : string;
             // object URL for preview
  errors: Record<string, string> = {};

  constructor(init?: Partial<CustomerForm>) {
    Object.assign(this, init);
  }

  updateField<K extends keyof CustomerForm>(name: K, value: any) {
    (this as any)[name] = value;
    this.validateField(name as string, value);
  }

  uploadProfilePic(file: File) {
    this.profilePicFile = file;
    if (this.profilePicPreview) URL.revokeObjectURL(this.profilePicPreview);
    this.profilePicPreview = URL.createObjectURL(file);
  }

  private validateField(name: string, value: any) {
    switch (name) {
      case "fullName":
        if (!value) this.errors.fullName = "Full name is required";
        else delete this.errors.fullName;
        break;
      case "email":
        if (!value) this.errors.email = "Email is required";
        else delete this.errors.email;
        break;
    }
  }

  validateAll() {
    Object.keys(this).forEach((key) => this.validateField(key, (this as any)[key]));
    return Object.keys(this.errors).length === 0;
  }

  reset() {
    return new CustomerForm();
  }

  toPayload() {
    return {
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      // for backend: you can send file as FormData if needed
      password: this.confirmNewPassword,
      confirmPassword: this.confirmNewPassword,
      language : this.language
    };
  }
}
