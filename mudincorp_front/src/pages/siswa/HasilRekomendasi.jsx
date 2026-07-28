import {AlertCircle,BookOpen,Building2,Calculator,CheckCircle2,ChevronDown,ChevronUp,FlaskConical,GraduationCap,Layers,Loader2,Printer,
  Table as TableIcon,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import {Bar,BarChart,CartesianGrid,ResponsiveContainer,Tooltip,XAxis,YAxis,} from "recharts";
import {getHasilRekomendasi,getKesiapanData,hitungRekomendasi,} from "../../services/hasilRekomendasiService";

// ── Data statis per jurusan UNIPMA ───────────────────────────────────────────
const JURUSAN_INFO = {
  "Kedokteran Umum": {
    foto: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&q=80",
    mataPelajaran: ["Biologi", "Kimia", "Fisika", "Bahasa Inggris Medis"],
    pembelajaran: [
      "Dasar-dasar anatomi dan fisiologi manusia",
      "Praktikum keterampilan klinik",
      "Etika kedokteran",
      "Pelatihan komunikasi pasien",
    ],
  },
  "Sistem Informasi": {
    foto: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80",
    mataPelajaran: [
      "Pemrograman",
      "Basis Data",
      "Analisis Sistem",
      "Manajemen Proyek TI",
    ],
    pembelajaran: [
      "Desain dan pengembangan aplikasi bisnis",
      "Analisis kebutuhan pengguna",
      "Manajemen data dan database",
      "Implementasi sistem informasi",
    ],
  },
  "Teknik Informatika": {
    foto: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
    mataPelajaran: [
      "Algoritma",
      "Struktur Data",
      "Jaringan Komputer",
      "Kecerdasan Buatan",
    ],
    pembelajaran: [
      "Pemrograman tingkat lanjut",
      "Pengembangan perangkat lunak",
      "Analisis data dan AI",
      "Keamanan jaringan",
    ],
  },
  Akuntansi: {
    foto: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80",
    mataPelajaran: [
      "Akuntansi Keuangan",
      "Perpajakan",
      "Audit",
      "Manajemen Keuangan",
    ],
    pembelajaran: [
      "Laporan keuangan dan analisis",
      "Perencanaan pajak",
      "Pengendalian internal",
      "Etika akuntansi",
    ],
  },
  "Teknik Sipil": {
    foto: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
    mataPelajaran: [
      "Konstruksi",
      "Mekanika Tanah",
      "Gambar Teknik",
      "Manajemen Proyek",
    ],
    pembelajaran: [
      "Perencanaan struktur bangunan",
      "Teknik pondasi dan material",
      "Estimasi biaya proyek",
      "Teknik konstruksi",
    ],
  },
  Informatika: {
    foto: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80",
    mataPelajaran: [
      "Pemrograman",
      "Basis Data",
      "Sistem Operasi",
      "Seni Rupa Digital",
    ],
    pembelajaran: [
      "Pengembangan perangkat lunak",
      "Manajemen informasi",
      "Analisis algoritma",
      "Desain antarmuka pengguna",
    ],
  },
};

const DEFAULT_JURUSAN_INFO = {
  foto: "https://images.unsplash.com/photo-1562774053-701939374585?w=600&q=80",
  mataPelajaran: ["Mata Pelajaran Umum", "Praktikum", "Seminar"],
  pembelajaran: [
    "Dasar-dasar bidang studi",
    "Keterampilan teknis",
    "Proyek akhir",
  ],
};

function getJurusanInfo(namaJurusan) {
  return JURUSAN_INFO[namaJurusan] || DEFAULT_JURUSAN_INFO;
}

// ── Data statis fakultas UNIPMA (untuk kartu foto rekomendasi utama) ─────────
const FAKULTAS_INFO = {
  "Fakultas Kedokteran": {
    foto: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&q=80",
    jumlahDosen: 24,
    laboratorium: [
      "Lab Anatomi",
      "Lab Fisiologi",
      "Lab Patologi",
      "Lab Keterampilan Klinik",
    ],
    fasilitas: [
      "Ruang Kuliah AC",
      "Perpustakaan Digital",
      "Klinik Pendidikan",
      "Simulator Medis",
    ],
    akreditasi: "B",
  },
  "Fakultas Teknologi Informasi": {
    foto: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
    jumlahDosen: 18,
    laboratorium: [
      "Lab Jaringan Komputer",
      "Lab Pemrograman",
      "Lab Multimedia",
      "Lab Sistem Informasi",
    ],
    fasilitas: [
      "Studio Coding",
      "Server Room",
      "Ruang Seminar",
      "Perpustakaan Digital",
    ],
    akreditasi: "B",
  },
  "Fakultas Ekonomi dan Bisnis": {
    foto: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80",
    jumlahDosen: 20,
    laboratorium: [
      "Lab Akuntansi Komputer",
      "Lab Kewirausahaan",
      "Lab Perbankan Syariah",
    ],
    fasilitas: [
      "Ruang Kuliah AC",
      "Ruang Baca",
      "Mini Bank",
      "Inkubator Bisnis",
    ],
    akreditasi: "B",
  },
  "Fakultas Teknik": {
    foto: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&q=80",
    jumlahDosen: 22,
    laboratorium: [
      "Lab Sipil & Material",
      "Lab Mekanik",
      "Lab Gambar Teknik",
      "Lab Uji Bahan",
    ],
    fasilitas: [
      "Workshop Teknik",
      "Studio CAD",
      "Ruang Kuliah AC",
      "Perpustakaan Teknik",
    ],
    akreditasi: "B",
  },
  "Fakultas Keguruan dan Ilmu Pendidikan": {
    foto: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80",
    jumlahDosen: 35,
    laboratorium: [
      "Lab Micro Teaching",
      "Lab Bahasa",
      "Lab IPA",
      "Lab Komputer Pendidikan",
    ],
    fasilitas: [
      "Ruang Kuliah AC",
      "Lab School",
      "Perpustakaan",
      "Aula Seminar",
    ],
    akreditasi: "B",
  },
  default: {
    foto: "https://images.unsplash.com/photo-1562774053-701939374585?w=600&q=80",
    jumlahDosen: 15,
    laboratorium: ["Laboratorium Utama", "Lab Praktikum"],
    fasilitas: ["Ruang Kuliah AC", "Perpustakaan", "Ruang Seminar"],
    akreditasi: "B",
  },
};

function getFakultasInfo(namaFakultas) {
  return FAKULTAS_INFO[namaFakultas] || FAKULTAS_INFO["default"];
}

// ── Kartu Foto Fakultas (rekomendasi utama) ──────────────────────────────────
function KartuFakultas({ hasil }) {
  const info = getFakultasInfo(hasil?.nama_fakultas);
  return (
    <div className="rounded-[28px] overflow-hidden border border-slate-200 bg-white shadow-md flex flex-col h-full">
      <div className="relative h-44 w-full overflow-hidden">
        <img
          src={info.foto}
          alt={hasil?.nama_fakultas}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <span className="inline-block rounded-full bg-blue-600/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
            Rekomendasi Utama
          </span>
          <h2 className="mt-1.5 text-xl font-extrabold text-white leading-tight drop-shadow">
            {hasil?.jurusan_rekomendasi}
          </h2>
          <p className="flex items-center gap-1.5 text-xs font-medium text-white/80 mt-0.5">
            <GraduationCap size={13} />
            {hasil?.nama_fakultas}
          </p>
        </div>
      </div>

      <div className="flex-1 p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-blue-50 p-3 flex items-center gap-2.5">
            <Users size={16} className="text-blue-600 shrink-0" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-400">
                Dosen
              </p>
              <p className="text-sm font-extrabold text-blue-800">
                {info.jumlahDosen} Pengajar
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3 flex items-center gap-2.5">
            <BookOpen size={16} className="text-emerald-600 shrink-0" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                Akreditasi
              </p>
              <p className="text-sm font-extrabold text-emerald-800">
                Peringkat {info.akreditasi}
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <FlaskConical size={14} className="text-slate-500" />
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Laboratorium
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {info.laboratorium.map((lab, i) => (
              <span
                key={i}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
              >
                {lab}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Building2 size={14} className="text-slate-500" />
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Fasilitas
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {info.fasilitas.map((f, i) => (
              <span
                key={i}
                className="rounded-lg border border-blue-100 bg-blue-50/70 px-2.5 py-1 text-[11px] font-semibold text-blue-700"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Komponen Utama ────────────────────────────────────────────────────────────
export default function HasilRekomendasi() {
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  const [hasil, setHasil] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [matriks, setMatriks] = useState({});
  const [matriksKeputusan, setMatriksKeputusan] = useState({});

  const [kesiapan, setKesiapan] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const siapResponse = await getKesiapanData();
      setKesiapan(siapResponse?.data || siapResponse);
      try {
        const response = await getHasilRekomendasi();
        const hasilData = response?.data || response;
        if (
          hasilData?.status === "belum_dihitung" ||
          !hasilData?.rekomendasi_utama
        ) {
          setHasil(null);
          setRanking([]);
          setMatriks({});
          setMatriksKeputusan({});
        } else {
          setHasil(hasilData.rekomendasi_utama);
          setRanking(hasilData.semua_ranking || []);
          setMatriks(hasilData.matriks_perhitungan || {});
          setMatriksKeputusan(hasilData.matriks_keputusan || {});
        }
      } catch (err) {
        if (err.response?.status !== 404)
          console.error("Kendala memuat hasil:", err);
        setHasil(null);
        setRanking([]);
        setMatriks({});
        setMatriksKeputusan({});
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Gagal memuat data utama.",
      );
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
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Gagal memproses perhitungan.",
      );
    } finally {
      setCalculating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-slate-500 animate-pulse">
          Menyinkronkan data rekomendasi...
        </p>
      </div>
    );
  }

  const jurusanList = Object.keys(matriks || {});
  const kriteriaList =
    jurusanList.length > 0 && Array.isArray(matriks[jurusanList[0]])
      ? matriks[jurusanList[0]].map((k) => ({
          kode: k.kode_kriteria,
          nama: k.nama_kriteria,
          bobot: k.bobot,
          tipe: k.tipe_kriteria,
        }))
      : [];

  return (
    <div className="space-y-8 px-6 pb-10 pt-24 animate-in fade-in duration-500">
      {/* ── HEADER ── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            Hasil Rekomendasi Jurusan
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Sistem Pendukung Keputusan Pemilihan Jurusan dengan Metode{" "}
            <span className="text-blue-600 font-semibold">SAW</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition shadow-sm hover:bg-slate-50"
          >
            <Printer size={16} /> Cetak
          </button>
          <button
            onClick={handleHitung}
            disabled={calculating || !kesiapan?.siap}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition shadow-md shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50"
          >
            {calculating ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Mengkalkulasi...
              </>
            ) : (
              <>
                <Calculator size={16} />{" "}
                {hasil ? "Hitung Ulang Perhitungan" : "Mulai Analisis Jurusan"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── NOTIFIKASI ── */}
      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50/70 p-4 shadow-sm">
          <div className="flex gap-3">
            <AlertCircle className="text-red-500 shrink-0" size={20} />
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      )}
      {message && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 shadow-sm">
          <div className="flex gap-3">
            <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
            <p className="text-sm font-medium text-emerald-800">{message}</p>
          </div>
        </div>
      )}

      {/* ── KESIAPAN DATA ── */}
      {kesiapan && !kesiapan.siap && (
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50/30 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600">
              <AlertCircle size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">
                Berkas Pengisian Belum Lengkap
              </h3>
              <p className="text-xs text-slate-500">
                Selesaikan seluruh tahapan berikut untuk mengaktifkan kalkulasi
                sistem.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Survei Bakat", status: kesiapan.survei_bakat },
              { label: "Survei Minat", status: kesiapan.survei_minat },
              { label: "Nilai Rapor", status: kesiapan.nilai_rapor },
              { label: "Bobot Kriteria", status: kesiapan.bobot_valid },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-2xs"
              >
                <span className="text-xs font-medium text-slate-600">
                  {item.label}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${item.status ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
                >
                  {item.status ? "Lengkap" : "Kosong"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── BELUM ADA HASIL ── */}
      {!hasil && kesiapan?.siap && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Layers size={28} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Hasil Rekomendasi Siap Diproses
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 leading-relaxed">
            Seluruh parameter data bernilai valid. Silakan tekan tombol
            kalkulasi untuk melihat rekomendasi jurusan terbaik Anda.
          </p>
        </div>
      )}

      {/* ── LAYOUT UTAMA ── */}
      {hasil && (
        <>
          {/* Baris atas: Kartu Foto Fakultas | Grafik */}
          <div className="grid gap-6 lg:grid-cols-12 items-stretch">
            {/* Kartu Foto Rekomendasi Utama */}
            <div className="lg:col-span-5">
              <KartuFakultas hasil={hasil} />
            </div>

            {/* Grafik dengan nama + skor di bawah batang */}
            <div className="lg:col-span-7">
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xs h-full">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-blue-600" size={18} />
                    <h3 className="font-bold text-slate-900 text-base">
                      Grafik Pemetaan Alternatif
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    Nilai Akhir Vektor
                  </span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={ranking.map((item) => ({
                        nama: item.nama_jurusan || "",
                        skor: Number(item.skor_akhir || 0),
                        isTop: item.ranking === 1,
                      }))}
                      margin={{ top: 10, right: 10, left: -20, bottom: 56 }}
                    >
                      <CartesianGrid
                        strokeDasharray="4 4"
                        vertical={false}
                        stroke="#F1F5F9"
                      />
                      <XAxis
                        dataKey="nama"
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        tick={(props) => {
                          const { x, y, payload, index } = props;
                          const item = ranking[index];
                          const skor = item
                            ? Number(item.skor_akhir).toFixed(4)
                            : "";
                          const isTop = item?.ranking === 1;
                          const nama = payload.value || "";
                          const short =
                            nama.length > 12
                              ? `${nama.substring(0, 12)}…`
                              : nama;
                          return (
                            <g transform={`translate(${x},${y})`}>
                              <text
                                x={0}
                                y={10}
                                textAnchor="middle"
                                fill={isTop ? "#1d4ed8" : "#64748b"}
                                fontSize={11}
                                fontWeight={isTop ? 700 : 500}
                              >
                                {short}
                              </text>
                              <line
                                x1={-18}
                                x2={18}
                                y1={18}
                                y2={18}
                                stroke="#e2e8f0"
                                strokeWidth={1}
                              />
                              <text
                                x={0}
                                y={32}
                                textAnchor="middle"
                                fill={isTop ? "#2563eb" : "#94a3b8"}
                                fontSize={10}
                                fontFamily="monospace"
                                fontWeight={isTop ? 800 : 500}
                              >
                                {skor}
                              </text>
                            </g>
                          );
                        }}
                      />
                      <YAxis
                        tick={{ fill: "#94A3B8", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: "#F8FAFC" }}
                        formatter={(value) => [
                          Number(value).toFixed(4),
                          "Skor Akhir",
                        ]}
                        contentStyle={{
                          borderRadius: "14px",
                          border: "none",
                          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.05)",
                        }}
                      />
                      <Bar
                        dataKey="skor"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={44}
                        fill="#2563eb"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* ── GRID KARTU FOTO PER JURUSAN (pengganti tabel prioritas) ── */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="text-blue-600" size={20} />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Urutan Prioritas &amp; Kelayakan Pilihan
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Profil setiap program studi — fokus pada mata pelajaran dan
                  ringkasan pembelajaran jurusan.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {ranking.map((item, idx) => {
                const isTop = item.ranking === 1;
                const info = getJurusanInfo(item.nama_jurusan);
                return (
                  <div
                    key={idx}
                    className={`group rounded-[22px] overflow-hidden border bg-white shadow-sm transition-shadow hover:shadow-md flex flex-col ${
                      isTop
                        ? "border-blue-300 ring-2 ring-blue-100"
                        : "border-slate-200"
                    }`}
                  >
                    {/* Foto */}
                    <div className="relative h-36 overflow-hidden shrink-0">
                      <img
                        src={info.foto}
                        alt={item.nama_jurusan}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                      {/* Badge rank */}
                      <span
                        className={`absolute top-3 left-3 inline-flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-black shadow ${isTop ? "bg-blue-600 text-white" : "bg-white/90 text-slate-700"}`}
                      >
                        #{item.ranking}
                      </span>

                      {/* Skor */}
                      <span
                        className={`absolute top-3 right-3 rounded-lg px-2.5 py-1 text-[11px] font-mono font-extrabold shadow ${isTop ? "bg-blue-600 text-white" : "bg-white/90 text-slate-700"}`}
                      >
                        {Number(item.skor_akhir).toFixed(4)}
                      </span>

                      {/* Nama overlay */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-[10px] font-semibold text-white/70 leading-none mb-0.5">
                          {item.nama_fakultas}
                        </p>
                        <h4 className="text-sm font-extrabold text-white leading-tight">
                          {item.nama_jurusan}
                        </h4>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 p-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <BookOpen
                          size={13}
                          className="text-indigo-500 mt-0.5 shrink-0"
                        />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1.5">
                            Mata Pelajaran Utama
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {info.mataPelajaran.map((pelajaran, i) => (
                              <span
                                key={i}
                                className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700"
                              >
                                {pelajaran}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <FlaskConical
                          size={13}
                          className="text-emerald-500 mt-0.5 shrink-0"
                        />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1.5">
                            Apa yang Dipelajari
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {info.pembelajaran.map((item, i) => (
                              <span
                                key={i}
                                className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── DETAIL MATRIKS SAW (AKORDION) ── */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
            <button
              onClick={() => setShowDetail(!showDetail)}
              className="flex w-full items-center justify-between bg-slate-50 px-6 py-4 hover:bg-slate-100 transition"
            >
              <div className="flex items-center gap-2.5">
                <TableIcon className="text-blue-600" size={18} />
                <span className="text-sm font-bold text-slate-800">
                  Transparansi Detail Perhitungan SAW
                </span>
              </div>
              {showDetail ? (
                <ChevronUp className="text-slate-400" size={18} />
              ) : (
                <ChevronDown className="text-slate-400" size={18} />
              )}
            </button>

            {showDetail && jurusanList.length > 0 && (
              <div className="border-t border-slate-200 p-5 space-y-6">
                {/* Tabel 1: Nilai Mentah */}
                <div>
                  <h4 className="mb-2.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    1. Matriks Keputusan (Nilai Mentah)
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-slate-800 border-b border-slate-200 font-semibold">
                        <tr>
                          <th className="px-4 py-3">Jurusan</th>
                          {kriteriaList.map((k) => (
                            <th
                              key={k.kode}
                              className="px-4 py-3"
                              title={k.nama}
                            >
                              {k.kode}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {jurusanList.map((jurusan) => (
                          <tr key={jurusan} className="hover:bg-slate-50/50">
                            <td className="px-4 py-2.5 font-medium text-slate-900">
                              {jurusan}
                            </td>
                            {matriksKeputusan[jurusan]?.map((k, idx) => (
                              <td key={idx} className="px-4 py-2.5">
                                {k.nilai_mentah}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tabel 2: Normalisasi */}
                <div>
                  <h4 className="mb-2.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    2. Matriks Normalisasi &amp; Bobot
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-slate-800 border-b border-slate-200 font-semibold">
                        <tr>
                          <th className="px-4 py-3">Jurusan</th>
                          {kriteriaList.map((k) => (
                            <th
                              key={k.kode}
                              className="px-4 py-3"
                              title={`Bobot: ${k.bobot} | Tipe: ${k.tipe}`}
                            >
                              {k.kode} ({k.bobot})
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {jurusanList.map((jurusan) => (
                          <tr key={jurusan} className="hover:bg-slate-50/50">
                            <td className="px-4 py-2.5 font-medium text-slate-900">
                              {jurusan}
                            </td>
                            {matriks[jurusan]?.map((k, idx) => (
                              <td key={idx} className="px-4 py-2.5">
                                <div className="flex flex-col">
                                  <span className="text-slate-500">
                                    {k.nilai_normalisasi}
                                  </span>
                                  <span className="text-[10px] text-blue-600 font-semibold">
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
            )}
          </div>
        </>
      )}
    </div>
  );
}
