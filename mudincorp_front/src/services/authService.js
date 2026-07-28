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
  const { token, user } = response.data; // ✅ DIPERBAIKI: ambil juga "user" dari response AuthController

  if (token) {
    localStorage.setItem("authToken", token);
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  // ✅ DITAMBAHKAN: simpan data user agar bisa dibaca SiswaLayout & DashboardSiswa
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  return response.data;
}

export async function register(data) {
  const response = await client.post("/register", data);
  const { token, user } = response.data; // ✅ DIPERBAIKI: sama seperti login

  if (token) {
    localStorage.setItem("authToken", token);
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  // ✅ DITAMBAHKAN
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  return response.data;
}

export function getAuthToken() {
  return localStorage.getItem("authToken");
}

// ✅ DITAMBAHKAN: helper terpusat untuk baca user dengan aman, dipakai di SiswaLayout/DashboardSiswa
export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

export function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user"); // ✅ DIPERBAIKI: hapus juga data user, bukan cuma token
  delete client.defaults.headers.common.Authorization;
}

export default client;