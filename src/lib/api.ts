import axios from "axios";

type ApiErrorPayload = {
  error?: unknown;
  message?: unknown;
};

function getErrorMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;

  const payload = data as ApiErrorPayload;
  if (typeof payload.error === "string") return payload.error;
  if (typeof payload.message === "string") return payload.message;

  return undefined;
}

export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to automatically inject auth tokens if available
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for centralized error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      console.warn("API request failed:", {
        status: error.response?.status,
        message: getErrorMessage(error.response?.data) ?? error.message,
      });
    } else {
      console.error("API Call Error:", error);
    }

    return Promise.reject(error);
  }
);
