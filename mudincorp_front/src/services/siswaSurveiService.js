import client from "./authService.js";

export async function fetchPertanyaanSurvei(tipe) {
  const { data } = await client.get(
    "/siswa/pertanyaan-survei",
    {
      params: { tipe },
    }
  );

  return data?.data || [];
}

export async function submitSurvei(payload) {
  const { data } = await client.post(
    "/siswa/jawaban-survei",
    payload
  );

  return data;
}