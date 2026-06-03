import { API_BASE, authFetchHeaders } from "../config/api.js";

export const LaporanService = {
  async getLaporan(params = {}) {
    const query = new URLSearchParams();

    if (params.kelas && params.kelas !== "Semua") {
      query.append("kelas", params.kelas);
    }

    if (params.status && params.status !== "Semua") {
      query.append("status", params.status);
    }

    const response = await fetch(
      `${API_BASE}/admin/laporan?${query.toString()}`,
      {
        method: "GET",
        headers: authFetchHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Gagal mengambil data laporan");
    }

    return await response.json();
  },

  async getFilterOptions() {
    const response = await fetch(
      `${API_BASE}/admin/laporan/filter-options`,
      {
        headers: authFetchHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Gagal mengambil filter");
    }

    return await response.json();
  },
  async exportPdf() {
  const response = await fetch(
    `${API_BASE}/admin/laporan/export-pdf`,
    {
      headers: authFetchHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Gagal export PDF");
  }

  return await response.blob();
}
};