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
      setLoading(false);
    }
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
      title: "Lengkapi Nilai",
      desc: "Pastikan semua nilai rapor semester 1-5 sudah diinput oleh Guru BK.",
      status: getStepStatus(1),
    },
    {
      step: "02",
      title: "Isi Survei Minat",
      desc: "Jawab pertanyaan seputar minat dan bakatmu secara jujur.",
      status: getStepStatus(2),
      link: "/siswa/survei",
    },
    {
      step: "03",
      title: "Lihat Hasil",
      desc: "Dapatkan rekomendasi jurusan kuliah yang paling sesuai untukmu.",
      status: getStepStatus(3),
      link: "/siswa/hasil",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
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
              className="group flex items-center gap-2 rounded-2xl bg-sky-500 px-6 py-3.5 font-bold text-white transition hover:bg-sky-600"
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
        
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-sky-500/20 blur-[100px]"></div>
        <div className="absolute -bottom-20 right-20 h-60 w-60 rounded-full bg-indigo-500/20 blur-[80px]"></div>
      </section>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {loading ? (
          <div className="col-span-3 flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
          </div>
        ) : (
          stats.map((stat, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
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
                <div className={`h-full w-2/3 rounded-full ${stat.color}`}></div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Workflow Section */}
      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900">Alur Pengerjaan</h2>
          <p className="text-slate-500">Ikuti langkah berikut untuk mendapatkan rekomendasi jurusan.</p>
        </div>

        <div className="relative grid gap-8 md:grid-cols-3">
          {steps.map((item, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center">
              <div className={`flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold border-4 ${
                item.status === "Completed" ? "bg-emerald-500 border-emerald-100 text-white" :
                item.status === "Action Required" ? "bg-sky-500 border-sky-100 text-white shadow-lg shadow-sky-200" :
                "bg-slate-100 border-slate-50 text-slate-400"
              }`}>
                {item.status === "Completed" ? (
                  <CheckCircle2 size={28} />
                ) : item.status === "Locked" ? (
                  <Lock size={22} />
                ) : (
                  item.step
                )}
              </div>
              <h4 className="mt-4 font-bold text-slate-900">{item.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {item.desc}
              </p>
              {item.status === "Action Required" && item.link && (
                <Link
                  to={item.link}
                  className="mt-3 inline-flex items-center gap-1 rounded-full bg-sky-50 px-4 py-1.5 text-sm font-bold text-sky-600 transition hover:bg-sky-100"
                >
                  Mulai
                  <ArrowRight size={14} />
                </Link>
              )}
              {item.status === "Completed" && item.step === "03" && item.link ? (
                <Link
                  to={item.link}
                  className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-bold text-white transition hover:bg-emerald-600"
                >
                  Lihat Hasil
                  <ArrowRight size={14} />
                </Link>
              ) : item.status === "Completed" ? (
                <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-600">
                  <CheckCircle2 size={14} />
                  Selesai
                </span>
              ) : null}
            </div>
          ))}
          
          {/* Connecting line */}
          <div className="absolute left-0 top-8 hidden h-0.5 w-full bg-slate-100 md:block"></div>
        </div>
      </section>
    </div>
  );
}
