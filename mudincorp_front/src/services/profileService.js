// src/services/profileService.js
import axios from "axios";

const API_URL = "http://localhost:8000/api/siswa"; 

const getAuthHeader = () => {
  // PRIORITAS UTAMA: Ambil 'authToken' karena di sana token Sanctum kamu disimpan
  let token = localStorage.getItem("authToken");

  // Cadangan jika sewaktu-waktu disimpan di dalam objek user
  if (!token) {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      token = parsedUser.token || parsedUser.authToken;
    }
  }

  // Debug untuk memastikan token 96|SpQsx... yang terbaca
  console.log("Token Sanctum yang dikirim:", token);

  return {
    "Authorization": `Bearer ${token}`,
    "Accept": "application/json",
  };
};

export const profileService = {
  getProfile: async () => {
    try {
      const response = await axios.get(`${API_URL}/profile`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Gagal mengambil data profil";
    }
  },

  updateProfile: async (formData) => {
    try {
      const response = await axios.post(`${API_URL}/profile`, formData, {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Gagal memperbarui profil";
    }
  },
};