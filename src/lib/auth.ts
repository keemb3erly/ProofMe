import { User } from "@/types/auth";

const SESSION_KEY = "user";
const TOKEN_KEY = "token";

export function saveSession(user: User, token?: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
  }
}

export function readSession(): User | null {
  if (typeof window === "undefined") return null;
  const user = window.localStorage.getItem(SESSION_KEY);
  if (!user) return null;
  try {
    return JSON.parse(user) as User;
  } catch (error) {
    console.error("Error parsing user session:", error);
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return readSession() !== null;
}

export function isAdmin(): boolean {
  const user = readSession();
  return user?.role === "ADMIN";
}

export function getRedirectPath(user: User | null): string {
  if (!user) return "/login";
  return user.role === "ADMIN" ? "/admin/dashboard" : "/";
}
