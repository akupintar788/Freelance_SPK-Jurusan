import client from "./authService.js";

/**
 * Ambil semua pertanyaan survei
 */
export async function fetchSoalSurvei(params = {}) {
  const response = await client.get(
    "/admin/pertanyaan-survei",
    {
      params,
    }
  );

  // backend:
  // {
  //   data: [...],
  //   summary: [...]
  // }

  return response.data.data;
}

/**
 * Tambah pertanyaan survei
 */
export async function createSoalSurvei(data) {
  const response = await client.post(
    "/admin/pertanyaan-survei",
    data
  );

  return response.data;
}

/**
 * Update pertanyaan survei
 */
export async function updateSoalSurvei(id, data) {
  const response = await client.put(
    `/admin/pertanyaan-survei/${id}`,
    data
  );

  return response.data;
}

/**
 * Hapus pertanyaan survei
 */
export async function deleteSoalSurvei(id) {
  const response = await client.delete(
    `/admin/pertanyaan-survei/${id}`
  );

  return response.data;
}