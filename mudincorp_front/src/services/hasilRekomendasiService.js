import { API_BASE, authFetchHeaders } from "../config/api";

/**
 * Cek kesiapan data siswa sebelum bisa hitung SAW.
 * Selalu dipanggil saat komponen mount.
 */
export async function getKesiapanData() {
  const res = await fetch(`${API_BASE}/siswa/kesiapan-data`, {
    headers: authFetchHeaders(),
  });

  // ✅ Cek status SEBELUM parse JSON
  //    Jika 401/403 → token expired atau bukan siswa
  if (res.status === 401 || res.status === 403) {
    throw new Error("Sesi habis. Silakan login ulang.");
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Gagal cek kesiapan data");
  }

  return data;
}

/**
 * Trigger kalkulasi SAW untuk siswa yang sedang login.
 */
export async function hitungRekomendasi() {
  const res = await fetch(`${API_BASE}/siswa/hitung-rekomendasi`, {
    method: "POST",
    headers: authFetchHeaders(),
  });

  const data = await res.json();

  if (!res.ok) {
    // Pesan error dari server (misal: "Data belum lengkap")
    throw new Error(data.message || "Gagal menghitung rekomendasi");
  }

  return data;
}

/**
 * Ambil hasil rekomendasi SAW siswa yang sedang login.
 *
 * FIX: Urutan operasi yang benar:
 *   1. Tunggu response
 *   2. Cek status 404 SEBELUM parse JSON (response body bisa saja bukan JSON)
 *   3. Parse JSON hanya jika status bukan 404
 *   4. Throw error hanya untuk status selain 200 dan 404
 */
export async function getHasilRekomendasi() {
  const res = await fetch(`${API_BASE}/siswa/hasil-rekomendasi`, {
    headers: authFetchHeaders(),
  });

  // ✅ FIX: Cek 404 SEBELUM res.json()
  //    Versi lama: await res.json() → cek 404
  //    Jika body 404 bukan JSON (misal Laravel HTML error page), versi lama crash.
  //    Versi ini: cek status dulu, baru parse body jika aman.
  if (res.status === 404) {
    return {
      status: "belum_dihitung",
      rekomendasi_utama: null,
      semua_ranking: [],
      matriks_perhitungan: {},
    };
  }

  // ✅ Handle token expired / bukan siswa
  if (res.status === 401 || res.status === 403) {
    throw new Error("Sesi habis. Silakan login ulang.");
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Gagal mengambil hasil rekomendasi");
  }

  return data;
}