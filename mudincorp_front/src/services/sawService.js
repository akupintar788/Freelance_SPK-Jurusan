import client from "./authService.js";

export const calculateSAW = async () => {
  const response = await client.post("/admin/saw/calculate");
  return response.data;
};

export const fetchSAWResults = async () => {
  const response = await client.get("/admin/saw/results");
  return response.data;
};

export const fetchSAWResultsBySiswa = async (siswaId) => {
  const response = await client.get(`/admin/saw/results/${siswaId}`);
  return response.data;
};
