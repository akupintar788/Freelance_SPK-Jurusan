
import client from "./authService.js";

export async function fetchJurusan() {
  const response = await client.get("/admin/jurusan");

  return Array.isArray(response.data)
    ? response.data
    : [];
}

export async function createJurusan(data) {
  const response = await client.post("/admin/jurusan", data);
  return response.data;
}

export async function updateJurusan(id, data) {
  const response = await client.put(`/admin/jurusan/${id}`, data);
  return response.data;
}

export async function deleteJurusan(id) {
  const response = await client.delete(`/admin/jurusan/${id}`);
  return response.data;
}

