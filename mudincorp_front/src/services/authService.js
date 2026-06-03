import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const client = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const savedToken = localStorage.getItem("authToken");
if (savedToken) {
  client.defaults.headers.common.Authorization = `Bearer ${savedToken}`;
}

export async function login(nip, password) {
  const response = await client.post("/login", { nip, password });
  const token = response.data.token;
  if (token) {
    localStorage.setItem("authToken", token);
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
  return response.data;
}

export async function register(data) {
  const response = await client.post("/register", data);
  const token = response.data.token;
  if (token) {
    localStorage.setItem("authToken", token);
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
  return response.data;
}

export function getAuthToken() {
  return localStorage.getItem("authToken");
}

export function logout() {
  localStorage.removeItem("authToken");
  delete client.defaults.headers.common.Authorization;
}

export default client;
