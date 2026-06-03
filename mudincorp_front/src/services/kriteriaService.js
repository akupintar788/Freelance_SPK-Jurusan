import client from "./authService.js";

export const fetchKriteria = async () => {
  const response = await client.get("/admin/kriteria");
  return response.data.data; // Mengambil array dari bungkus 'data' backend
};

export const createKriteria = async (data) => {
  const response = await client.post("/admin/kriteria", data);
  return response.data;
};

export const updateKriteria = async (id, data) => {
  const response = await client.put(`/admin/kriteria/${id}`, data);
  return response.data;
};

export const deleteKriteria = async (id) => {
  const response = await client.delete(`/admin/kriteria/${id}`);
  return response.data;
};