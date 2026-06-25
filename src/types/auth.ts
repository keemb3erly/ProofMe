export interface User {
  id: string;
  fullName: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt?: string;
}

export interface Session {
  user: User;
  message?: string;
}
