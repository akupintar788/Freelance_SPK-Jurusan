import {
  AlertCircle,
  Calculator,
  CheckCircle2,
  Eye,
  Loader2,
  Play,
  Table as TableIcon,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE, authFetchHeaders } from "../../../config/api.js";

export default function SAWProcessPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // --- STATE UNTUK MODAL DETAIL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/saw/results`, {
        headers: authFetchHeaders(),
      });
      const data = await res.json();
      if (res.ok) setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNGSI UNTUK MELIHAT DETAIL SISWA (MEMBUKA MODAL) ---
  const handleViewDetail = async (siswaId) => {
    setIsModalOpen(true);
    setLoadingDetail(true);
    setSelectedDetail(null);
    try {
      // SESUAIKAN ROUTE INI DENGAN ROUTE LARAVEL UNTUK ADMIN MELIHAT HASIL SISWA
      const res = await fetch(`${API_BASE}/admin/saw/hasil/${siswaId}`, {
        headers: authFetchHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedDetail(data);
      } else {
        alert(data.message || "Gagal mengambil detail siswa.");
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan server saat mengambil detail.");
      setIsModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCalculateAll = async () => {
    setCalculating(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/admin/saw/calculate`, {
        method: "POST",
        headers: authFetchHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setResults(data.results || []);
      } else {
        setError(data.message || "Gagal melakukan perhitungan SAW.");
      }
    } catch (err) {
      setError("Terjadi kesalahan server saat perhitungan SAW.");
    } finally {
      setCalculating(false);
    }
  };

  // --- HELPER UNTUK RENDER TABEL DI DALAM MODAL ---
  const renderDetailTables = () => {
    if (!selectedDetail) return null;

    const matriks = selectedDetail.matriks_perhitungan || {};
    const matriksKeputusan = selectedDetail.matriks_keputusan || {};
    const jurusanList = Object.keys(matriks);

    if (jurusanList.length === 0)
      return (
        <p className="text-center text-slate-500 py-4">
          Data perhitungan tidak ditemukan.
        </p>
      );

    const kriteriaList = matriks[jurusanList[0]].map((k) => ({
      kode: k.kode_kriteria,
      nama: k.nama_kriteria,
      bobot: k.bobot,
    }));

    return (
      <div className="space-y-6 mt-4">
        {/* Tabel Nilai Mentah */}
        <div>
          <h4 className="mb-2 font-semibold text-slate-800">
            1. Matriks Keputusan (Nilai Mentah)
          </h4>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-900 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Jurusan</th>
                  {kriteriaList.map((k) => (
                    <th
                      key={k.kode}
                      className="px-4 py-3 font-semibold"
                      title={k.nama}
                    >
                      {k.kode}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jurusanList.map((jurusan) => (
                  <tr key={jurusan} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {jurusan}
                    </td>
                    {matriksKeputusan[jurusan]?.map((k, idx) => (
                      <td key={idx} className="px-4 py-3">
                        {k.nilai_mentah}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabel Normalisasi */}
        <div>
          <h4 className="mb-2 font-semibold text-slate-800">
            2. Matriks Normalisasi & Bobot
          </h4>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-900 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Jurusan</th>
                  {kriteriaList.map((k) => (
                    <th key={k.kode} className="px-4 py-3 font-semibold">
                      {k.kode} ({k.bobot})
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jurusanList.map((jurusan) => (
                  <tr key={jurusan} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {jurusan}
                    </td>
                    {matriks[jurusan]?.map((k, idx) => (
                      <td key={idx} className="px-4 py-3">
                        <div className="flex flex-col">
                          <span>{k.nilai_normalisasi}</span>
                          <span className="text-xs text-sky-600 font-medium">
                            x {k.bobot} = {k.nilai_terbobot}
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Proses SAW</h1>
          <p className="text-slate-500 text-sm">
            Hitung dan lihat hasil rekomendasi jurusan untuk seluruh siswa
            secara massal.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {message && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
          <CheckCircle2 size={20} />
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}

      {/* TABEL REKAP UTAMA */}
      <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 size={32} className="animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-900">
                <tr>
                  <th className="px-6 py-4 font-semibold">Nama Siswa</th>
                  <th className="px-6 py-4 font-semibold">Rekomendasi Utama</th>
                  <th className="px-6 py-4 font-semibold text-right">
                    Nilai Preferensi
                  </th>
                  <th className="px-6 py-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.length > 0 ? (
                  results
                    .filter((r) => r.ranking === 1)
                    .map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {r.siswa_nama}
                        </td>
                        <td className="px-6 py-4">
                          {r.jurusan_nama || r.jurusan?.nama_jurusan || "-"}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-sky-600">
                          {Number(r.nilai_akhir).toFixed(4)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleViewDetail(r.siswa_id)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-sky-100 hover:text-sky-700"
                          >
                            <Eye size={14} /> Detail
                          </button>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <Calculator size={32} className="mb-2 text-slate-300" />
                        <p>
                          Belum ada data perhitungan. Klik "Hitung Semua Siswa"
                          untuk memulai.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL / POPUP DETAIL PERHITUNGAN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in p-4">
          <div className="w-full max-w-4xl overflow-hidden rounded-[28px] bg-white shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div
              className="relative overflow-hidden px-6 py-5"
              style={{
                background:
                  "linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e40af 100%)",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <TableIcon className="text-white" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-200">
                      Detail Perhitungan
                    </p>
                    <h3 className="text-lg font-bold text-white">
                      Transparansi Detail -{" "}
                      {selectedDetail?.rekomendasi_utama?.nama_siswa || "Siswa"}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white hover:bg-white/30 transition"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 flex-1">
              {loadingDetail ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 size={32} className="animate-spin text-sky-500" />
                  <span className="ml-3 text-slate-500">
                    Memuat detail matriks...
                  </span>
                </div>
              ) : (
                <>
                  {selectedDetail?.rekomendasi_utama && (
                    <div className="mb-6 rounded-2xl bg-sky-50 p-5 border border-sky-100">
                      <p className="text-sm text-sky-700 font-semibold mb-1">
                        Rekomendasi Utama (Rank #1)
                      </p>
                      <h4 className="text-2xl font-bold text-sky-900">
                        {selectedDetail.rekomendasi_utama.jurusan_rekomendasi}
                      </h4>
                      <p className="text-sky-800 text-sm">
                        Skor Akhir:{" "}
                        <span className="font-bold">
                          {Number(
                            selectedDetail.rekomendasi_utama.skor_tertinggi,
                          ).toFixed(4)}
                        </span>
                      </p>
                    </div>
                  )}
                  {renderDetailTables()}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 text-right">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl bg-slate-800 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
