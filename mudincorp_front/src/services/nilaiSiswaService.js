import client from "./authService.js";

export const fetchNilaiSiswa = async () => {
  const response = await client.get("/admin/nilai-siswa");
  return response.data;
};

export const saveNilaiSiswa = async (data) => {
  const response = await client.post("/admin/nilai-siswa", data);
  return response.data;
};
