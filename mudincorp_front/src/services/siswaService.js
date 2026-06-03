import client from "./authService.js";

export const fetchSiswa = async () => {
  const response = await client.get("/admin/siswa", {
    params: {
      role: "siswa",
    },
  });

  return Array.isArray(response.data)
    ? response.data
    : response.data.data || [];
};

export const createSiswa = async (data) => {
  const response = await client.post(
    "/admin/siswa",
    data
  );

  return response.data;
};

export const updateSiswa = async (id, data) => {
  const response = await client.put(
    `/admin/siswa/${id}`,
    data
  );

  return response.data;
};

export const deleteSiswa = async (id) => {
  const response = await client.delete(
    `/admin/siswa/${id}`
  );

  return response.data;
};