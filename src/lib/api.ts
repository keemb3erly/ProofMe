import axios from "axios";

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
    console.error("API Call Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);
