
import client from "./authService.js";

export async function fetchFakultas() {
  const response = await client.get("/admin/fakultas");

  return Array.isArray(response.data)
    ? response.data
    : [];
}

export async function createFakultas(data) {
  const response = await client.post("/admin/fakultas", data);
  return response.data;
}

export async function updateFakultas(id, data) {
  const response = await client.put(`/admin/fakultas/${id}`, data);
  return response.data;
}

export async function deleteFakultas(id) {
  const response = await client.delete(`/admin/fakultas/${id}`);
  return response.data;
}

