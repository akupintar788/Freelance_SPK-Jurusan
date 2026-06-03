export const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export function getAuthToken() {
  return localStorage.getItem("authToken");
}

export function authFetchHeaders(extra = {}) {
  const token = getAuthToken();
  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}
