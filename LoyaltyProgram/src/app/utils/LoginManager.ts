export class LoginManager {
  private username: string = "";
  private password: string = "";

  setCredentials(username: string, password: string) {
    this.username = username;
    this.password = password;
  }

  validate(): void {
    if (!this.username || !this.password) {
      throw new Error("Username and password are required");
    }
  }

  async login(): Promise<any> {
    this.validate();

    const res = await fetch("/api/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: this.username, password: this.password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    return data; // could return {user, token, ...}
  }
}
