import { useEffect, useState } from "react";
import { fetchSiswa } from "../../services/siswaService.js";

export default function DataSiswaPage() {
  const [siswas, setSiswas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchSiswa();
        setSiswas(data);
      } catch (err) {
        setError("Gagal memuat data siswa. Coba muat ulang halaman.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <section className="gurubk-page min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Data Siswa</h1>
          <p className="mt-2 text-sm text-slate-500">
            Daftar siswa yang terdaftar dalam sistem pemilihan jurusan.
          </p>
        </header>

        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          {loading ? (
            <div className="px-4 py-6 text-sm text-slate-500">
              Memuat data siswa...
            </div>
          ) : error ? (
            <div className="px-4 py-6 text-sm text-rose-700">{error}</div>
          ) : (
            <table className="min-w-full text-left text-sm text-slate-700">
              <thead>
                <tr>
                  <th className="border-b border-slate-200 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    No
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    Nama
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    NISN (NIP)
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    Kelas
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    Jurusan Saat Ini
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {siswas.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="border-b border-slate-200 px-4 py-6 text-center text-sm text-slate-500"
                    >
                      Belum ada siswa terdaftar.
                    </td>
                  </tr>
                ) : (
                  siswas.map((siswa, index) => (
                    <tr key={siswa.id} className="hover:bg-slate-50">
                      <td className="border-b border-slate-200 px-4 py-3">
                        {index + 1}
                      </td>
                      <td className="border-b border-slate-200 px-4 py-3">
                        {siswa.nama}
                      </td>
                      <td className="border-b border-slate-200 px-4 py-3">
                        {siswa.user?.nip || "-"}
                      </td>
                      <td className="border-b border-slate-200 px-4 py-3">
                        {siswa.kelas}
                      </td>
                      <td className="border-b border-slate-200 px-4 py-3">
                        {siswa.jurusan || "-"}
                      </td>
                      <td className="border-b border-slate-200 px-4 py-3">
                        <button className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}

