import client from "./authService.js";

// GET ALL
export async function fetchNilaiRapor() {
  const response = await client.get("/admin/nilai-rapor");
  return response.data;
}

// CREATE
export async function createNilaiRapor(data) {
  const response = await client.post("/admin/nilai-rapor", data);
  return response.data;
}

// UPDATE
export async function updateNilaiRapor(id, data) {
  const response = await client.put(
    `/admin/nilai-rapor/${id}`,
    data
  );

  return response.data;
}

// DELETE
export async function deleteNilaiRapor(id) {
  const response = await client.delete(
    `/admin/nilai-rapor/${id}`
  );

  return response.data;
}

// IMPORT EXCEL
export async function importNilaiRapor(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await client.post(
    "/admin/nilai-rapor/import",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}