import { useEffect, useState } from "react";
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calculator,
  Printer,
  ChevronDown,
  ChevronUp,
  Table as TableIcon
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import {
  getHasilRekomendasi,
  hitungRekomendasi,
  getKesiapanData,
} from "../../services/hasilRekomendasiService";

export default function HasilRekomendasi() {
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  const [hasil, setHasil] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [matriks, setMatriks] = useState({});
  const [matriksKeputusan, setMatriksKeputusan] = useState({}); // State baru untuk Nilai Mentah

  const [kesiapan, setKesiapan] = useState(null);
  const [showDetail, setShowDetail] = useState(false); // State untuk buka/tutup tabel

  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      // 1. Ambil data kesiapan form
      const siapResponse = await getKesiapanData();
      const siapData = siapResponse?.data || siapResponse;
      setKesiapan(siapData);

      try {
        // 2. Ambil data hasil rekomendasi SAW
        const response = await getHasilRekomendasi();
        const hasilData = response?.data || response;

        if (hasilData?.status === 'belum_dihitung' || !hasilData?.rekomendasi_utama) {
          setHasil(null);
          setRanking([]);
          setMatriks({});
          setMatriksKeputusan({});
        } else {
          setHasil(hasilData.rekomendasi_utama);
          setRanking(hasilData.semua_ranking || []);
          setMatriks(hasilData.matriks_perhitungan || {});
          setMatriksKeputusan(hasilData.matriks_keputusan || {}); // Tangkap Nilai Mentah
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setHasil(null);
          setRanking([]);
          setMatriks({});
          setMatriksKeputusan({});
        } else {
          console.error("Kendala memuat hasil rekomendasi:", err);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Gagal memuat data utama.");
    } finally {
      setLoading(false);
    }
  }

  async function handleHitung() {
    try {
      setCalculating(true);
      setError(null);
      setMessage(null);

      const response = await hitungRekomendasi();
      const res = response?.data || response;

      setMessage(res?.message || "Rekomendasi jurusan berhasil dikalkulasi.");

      // Refresh data komponen setelah kalkulasi sukses
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Gagal memproses perhitungan.");
    } finally {
      setCalculating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-sky-500" />
      </div>
    );
  }

  const chartData = ranking.map((item) => ({
    nama: item.nama_jurusan,
    skor: Number(item.skor_akhir),
  }));

  // Ekstrak daftar jurusan & kriteria untuk tabel (dari Object yg dikirim backend)
  const jurusanList = Object.keys(matriks);
  const kriteriaList = jurusanList.length > 0 ? matriks[jurusanList[0]].map(k => ({
    kode: k.kode_kriteria,
    nama: k.nama_kriteria,
    bobot: k.bobot,
    tipe: k.tipe_kriteria
  })) : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Hasil Rekomendasi Jurusan
          </h1>
          <p className="text-slate-500">
            Berdasarkan metode SAW (Simple Additive Weighting)
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold transition hover:bg-slate-50"
          >
            <div className="flex items-center gap-2">
              <Printer size={18} />
              Cetak
            </div>
          </button>

          <button
            onClick={handleHitung}
            disabled={calculating || !kesiapan?.siap}
            className="rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-white transition hover:bg-sky-600 disabled:opacity-50"
          >
            <div className="flex items-center gap-2">
              {calculating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Menghitung...
                </>
              ) : (
                <>
                  <Calculator size={18} />
                  {hasil ? "Hitung Ulang" : "Hitung Rekomendasi"}
                </>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Error & Success Messages */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex gap-3">
            <AlertCircle className="text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}
      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex gap-3">
            <CheckCircle2 className="text-emerald-500" />
            <p className="text-emerald-700">{message}</p>
          </div>
        </div>
      )}

      {/* Kesiapan Form */}
      {kesiapan && !kesiapan.siap && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="font-bold text-amber-800">Data Belum Lengkap</h3>
          <div className="mt-4 space-y-2 text-sm">
            <div>Survei Bakat : {kesiapan.survei_bakat ? " ✅" : " ❌"}</div>
            <div>Survei Minat : {kesiapan.survei_minat ? " ✅" : " ❌"}</div>
            <div>Nilai Rapor : {kesiapan.nilai_rapor ? " ✅" : " ❌"}</div>
            <div>Bobot Kriteria : {kesiapan.bobot_valid ? " ✅" : " ❌"}</div>
          </div>
        </div>
      )}

      {/* Belum ada hasil */}
      {!hasil && kesiapan?.siap && (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
          <Calculator className="mx-auto mb-4 text-slate-400" size={50} />
          <h2 className="text-xl font-bold">Belum Ada Hasil</h2>
          <p className="mt-2 text-slate-500">
            Klik tombol hitung rekomendasi untuk memulai proses SAW.
          </p>
        </div>
      )}

      {/* TAMPILAN HASIL UTAMA */}
      {hasil && (
        <>
          {/* Top Result */}
          <div className="rounded-[32px] bg-slate-900 p-10 text-white shadow-xl">
            <div className="flex items-center gap-6">
              <div className="rounded-full bg-sky-500/20 p-6">
                <Award size={60} className="text-sky-400" />
              </div>
              <div>
                <p className="text-sky-300">Rekomendasi Utama</p>
                <h2 className="text-4xl font-bold">{hasil.jurusan_rekomendasi}</h2>
                <p className="mt-2 text-slate-300">{hasil.nama_fakultas}</p>
                <p className="mt-4 text-xl">
                  Skor Akhir :
                  <span className="ml-2 font-bold text-sky-400">
                    {Number(hasil.skor_tertinggi).toFixed(4)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold">Grafik Ranking Jurusan</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="nama" tick={{ fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="skor" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ranking Cards */}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {ranking.map((item) => (
              <div key={item.ranking} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-xl bg-sky-500 px-4 py-2 font-bold text-white">#{item.ranking}</span>
                  <span className="font-bold text-sky-600">{Number(item.skor_akhir).toFixed(4)}</span>
                </div>
                <h3 className="text-xl font-bold">{item.nama_jurusan}</h3>
                <p className="mt-2 text-sm text-slate-500">{item.nama_fakultas}</p>
                <p className="mt-4 text-sm text-slate-600 line-clamp-2">{item.deskripsi}</p>
              </div>
            ))}
          </div>

          {/* AKORDION TRANSPARANSI PERHITUNGAN */}
          <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <button
              onClick={() => setShowDetail(!showDetail)}
              className="flex w-full items-center justify-between bg-slate-50 px-6 py-5 hover:bg-slate-100 transition"
            >
              <div className="flex items-center gap-3">
                <TableIcon className="text-sky-600" />
                <span className="text-lg font-bold text-slate-800">Transparansi Detail Perhitungan SAW</span>
              </div>
              {showDetail ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
            </button>

            {showDetail && jurusanList.length > 0 && (
              <div className="border-t border-slate-200 p-6">
                
                {/* Tabel 1: Nilai Mentah */}
                <h4 className="mb-3 font-semibold text-slate-800">1. Matriks Keputusan (Nilai Mentah)</h4>
                <div className="mb-8 overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-900 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Jurusan</th>
                        {kriteriaList.map((k) => (
                          <th key={k.kode} className="px-4 py-3 font-semibold" title={k.nama}>
                            {k.kode}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {jurusanList.map((jurusan) => (
                        <tr key={jurusan} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900">{jurusan}</td>
                          {matriksKeputusan[jurusan]?.map((k, idx) => (
                            <td key={idx} className="px-4 py-3">{k.nilai_mentah}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Tabel 2: Normalisasi */}
                <h4 className="mb-3 font-semibold text-slate-800">2. Matriks Normalisasi & Bobot</h4>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-900 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Jurusan</th>
                        {kriteriaList.map((k) => (
                          <th key={k.kode} className="px-4 py-3 font-semibold" title={`Bobot: ${k.bobot} | Tipe: ${k.tipe}`}>
                            {k.kode} ({k.bobot})
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {jurusanList.map((jurusan) => (
                        <tr key={jurusan} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900">{jurusan}</td>
                          {matriks[jurusan]?.map((k, idx) => (
                            <td key={idx} className="px-4 py-3">
                              <div className="flex flex-col">
                                <span>{k.nilai_normalisasi}</span>
                                <span className="text-xs text-sky-600 font-medium">x {k.bobot} = {k.nilai_terbobot}</span>
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  *Skor Akhir didapat dari penjumlahan nilai yang sudah dikalikan bobot (angka biru) pada masing-masing jurusan.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}