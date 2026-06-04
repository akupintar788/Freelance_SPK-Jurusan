import { useState, useEffect } from "react";
import {
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Loader2,
  CheckCircle2,
  Lock,
  AlertCircle,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import { API_BASE, authFetchHeaders } from "../../config/api.js";

export default function DashboardSiswa() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard`, {
        headers: authFetchHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setProgress(data.progress || null);
      }
    } catch (err) {
      console.error("Gagal fetch dashboard:", err);
    } finally {
      styleLoadingDelay();
    }
  };

  const styleLoadingDelay = () => {
    setTimeout(() => setLoading(false), 300);
  };

  // Hitung status step berdasarkan data API
  const getStepStatus = (stepNumber) => {
    if (!progress) return "Locked";
    switch (stepNumber) {
      case 1:
        return progress.has_nilai_rapor ? "Completed" : "Action Required";
      case 2:
        if (!progress.has_nilai_rapor) return "Locked";
        return progress.has_survei ? "Completed" : "Action Required";
      case 3:
        if (!progress.has_nilai_rapor || !progress.has_survei) return "Locked";
        return progress.has_hasil ? "Completed" : "Action Required";
      default:
        return "Locked";
    }
  };

  const stats = [
    {
      label: "Rata-rata Nilai",
      value: progress ? progress.rata_rata?.toFixed(2) || "0.00" : user.rata_rata || "0.00",
      icon: TrendingUp,
      color: "bg-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      label: "Mata Pelajaran",
      value: progress ? progress.nilai_rapor_count : "—",
      icon: BookOpen,
      color: "bg-sky-500",
      bg: "bg-sky-50",
    },
    {
      label: "Status Survei",
      value: progress
        ? progress.has_survei
          ? "Sudah Diisi"
          : "Belum Diisi"
        : "—",
      icon: ClipboardCheck,
      color: progress?.has_survei ? "bg-emerald-500" : "bg-amber-500",
      bg: progress?.has_survei ? "bg-emerald-50" : "bg-amber-50",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Lengkapi Nilai Rapor",
      desc: "Pastikan nilai rapor semester 1-5 sudah diinput lengkap oleh pihak kurikulum atau Guru BK.",
      status: getStepStatus(1),
    },
    {
      step: "02",
      title: "Isi Survei Minat & Bakat",
      desc: "Jawab seluruh instrumen pertanyaan seputar minat dan bakatmu secara jujur dan objektif.",
      status: getStepStatus(2),
      link: "/siswa/survei",
    },
    {
      step: "03",
      title: "Lihat Hasil Rekomendasi",
      desc: "Dapatkan hasil analisis kalkulasi metode SAW berupa rekomendasi program studi terbaik.",
      status: getStepStatus(3),
      link: "/siswa/hasil",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-sky-500" />
        <p className="text-sm font-medium text-slate-500">Memuat dashboard siswa...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[32px] bg-slate-900 p-8 text-white shadow-2xl md:p-12">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-md">
            <Sparkles size={16} className="text-sky-400" />
            <span>Sistem Pendukung Keputusan Pemilihan Jurusan</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight md:text-5xl">
            Selamat Datang, <span className="text-sky-400">{user.name || "Siswa"}</span>! 👋
          </h1>
          <p className="mt-4 text-lg text-slate-300">
            Mari tentukan masa depanmu dengan bantuan analisis data nilai dan minat yang akurat.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/siswa/survei"
              className="group flex items-center gap-2 rounded-2xl bg-sky-500 px-6 py-3.5 font-bold text-white transition hover:bg-sky-600 shadow-lg shadow-sky-500/20"
            >
              Mulai Survei Minat
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/siswa/hasil"
              className="rounded-2xl bg-white/10 px-6 py-3.5 font-bold text-white backdrop-blur-md transition hover:bg-white/20"
            >
              Lihat Rekomendasi
            </Link>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-sky-500/20 blur-[100px]"></div>
        <div className="absolute -bottom-20 right-20 h-60 w-60 rounded-full bg-indigo-500/20 blur-[80px]"></div>
      </section>

      {/* Main Info Dashboard Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Progress Card */}
        <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">
                Progress Kelengkapan Data
              </h3>
              <span className="font-bold text-sky-600 text-lg">
                {progress?.persentase || 0}%
              </span>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-700"
                style={{ width: `${progress?.persentase || 0}%` }}
              />
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <span className="text-sm font-medium text-slate-600">Nilai Rapor</span>
                {progress?.has_nilai_rapor ? (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full"><CheckCircle2 size={14} /> Terisi</div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full"><AlertCircle size={14} /> Belum Ada</div>
                )}
              </div>

              <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <span className="text-sm font-medium text-slate-600">Survei Minat & Bakat</span>
                {progress?.has_survei ? (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full"><CheckCircle2 size={14} /> Sudah Selesai</div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full"><AlertCircle size={14} /> Perlu Diisi</div>
                )}
              </div>

              <div className="flex items-center justify-between pb-2">
                <span className="text-sm font-medium text-slate-600">Hasil Rekomendasi</span>
                {progress?.has_hasil ? (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full"><CheckCircle2 size={14} /> Siap Dilihat</div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full"><Lock size={14} /> Terkunci</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Major Recommendation Main Card */}
        <div className="flex flex-col justify-between rounded-3xl bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-white/70 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
              Jurusan Rekomendasi Utama
            </span>
            <h2 className="mt-6 text-3xl font-extrabold md:text-4xl tracking-tight">
              {progress?.jurusan_utama || "Belum Tersedia"}
            </h2>
            <p className="mt-4 text-sm text-white/80 leading-relaxed max-w-sm">
              {progress?.has_hasil 
                ? "Hasil ini didapatkan berdasarkan perhitungan optimalisasi bobot nilai rapor akademis dan kecocokan psikologi minat bakatmu."
                : "Sistem akan menampilkan rekomendasi jurusan terbaikmu di sini setelah seluruh rangkaian administrasi data terselesaikan."
              }
            </p>
          </div>
          <div className="absolute -bottom-10 -right-10 text-white/5 pointer-events-none">
            <Sparkles size={200} />
          </div>
        </div>
      </div>

      {/* Quick Navigation Links */}
      <div className="grid gap-5 sm:grid-cols-3">
        <Link
          to="/siswa/survei"
          className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-500 group-hover:scale-110 transition-transform">
            <ClipboardCheck size={24} />
          </div>
          <h3 className="font-bold text-slate-900">Isi Survei</h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Lengkapi pengisian kuisioner minat bakat pilihan karir.
          </p>
        </Link>

        <Link
          to="/siswa/hasil"
          className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 group-hover:scale-110 transition-transform">
            <TrendingUp size={24} />
          </div>
          <h3 className="font-bold text-slate-900">Hasil Rekomendasi</h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Lihat daftar urutan prodi hasil hitung ranking matriks SAW.
          </p>
        </Link>

        <Link
          to="/siswa/profil"
          className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-500 group-hover:scale-110 transition-transform">
            <User size={24} />
          </div>
          <h3 className="font-bold text-slate-900">Profil Saya</h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Periksa data personal sekolah dan kredensial akun login.
          </p>
        </Link>
      </div>

      {/* Stats Summary Widgets */}
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                <h3 className="mt-1 text-3xl font-bold text-slate-900">{stat.value}</h3>
              </div>
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stat.bg} ${stat.color} bg-opacity-10 transition-transform group-hover:scale-110`}>
                <stat.icon size={28} className={stat.color.replace("bg-", "text-")} />
              </div>
            </div>
            <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-slate-100">
              <div 
                className={`h-full rounded-full ${stat.color}`}
                style={{ width: progress?.persentase ? `${progress.persentase}%` : "100%" }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Workflow Section (Langkah Alur) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-900">Alur Penggunaan Aplikasi</h3>
          <p className="text-sm text-slate-500 mt-1">Ikuti petunjuk langkah demi langkah berikut untuk menerbitkan rekomendasi jurusan Anda.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 relative">
          {steps.map((item, index) => {
            const isCompleted = item.status === "Completed";
            const isLocked = item.status === "Locked";

            return (
              <div 
                key={index} 
                className={`relative flex flex-col justify-between rounded-2xl p-5 border transition-all ${
                  isCompleted 
                    ? "border-emerald-200 bg-emerald-50/20" 
                    : isLocked 
                    ? "border-slate-100 bg-slate-50/50 opacity-60" 
                    : "border-sky-200 bg-sky-50/30 ring-2 ring-sky-500/10"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-2xl font-black ${isCompleted ? "text-emerald-400" : isLocked ? "text-slate-300" : "text-sky-400"}`}>
                      {item.step}
                    </span>
                    
                    {/* Status Badge */}
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle2 size={14}/> Selesai</span>
                    ) : isLocked ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-slate-400"><Lock size={14}/> Terkunci</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-sky-600 animate-pulse"><AlertCircle size={14}/> Belum Diisi</span>
                    )}
                  </div>

                  <h4 className="mt-3 font-bold text-slate-900">{item.title}</h4>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>

                {item.link && !isLocked && (
                  <div className="mt-4 pt-3 border-t border-dashed border-slate-200">
                    <Link 
                      to={item.link} 
                      className={`inline-flex items-center gap-1 text-xs font-bold transition-all ${isCompleted ? "text-emerald-600 hover:text-emerald-700" : "text-sky-600 hover:text-sky-700"}`}
                    >
                      {isCompleted ? "Buka Kembali" : "Kerjakan Sekarang"} <ArrowRight size={12} />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}