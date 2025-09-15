// validators/UserValidator.ts
export class UserValidator {
  static validateRegistration(data: any) {
    const { fullName, email, phone, password, confirmPassword } = data;

    if (!fullName || !email || !phone || !password || !confirmPassword) {
      throw new Error("All fields are required");
    }
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }
  }

  static validateLogin(data: any) {
    const { username, password } = data;

    if (!username || !password) {
      throw new Error("Username and password are required");
    }
    if (username.length < 3) {
      throw new Error("Username must be at least 3 characters long");
    }
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }
  }
}
