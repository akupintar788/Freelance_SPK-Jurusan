import {
  ArrowRight,
  ChevronRight,
  ClipboardCheck,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE, authFetchHeaders } from "../../config/api.js";

/* ─────────── SVG Icons ─────────── */
const IconUsers = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconBook = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);
const IconMonitor = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);
const IconTarget = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);
const IconBuilding = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/>
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/>
    <path d="M7 21h10"/><path d="M12 3v18"/>
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
  </svg>
);
const IconAward = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/>
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);

const FAKULTAS = [
  { name: "Fakultas Teknik",        icon: <IconUsers /> },
  { name: "Fakultas Ekonomi",       icon: <IconBook /> },
  { name: "Fakultas Ilmu Komputer", icon: <IconMonitor /> },
  { name: "Fakultas Psikologi",     icon: <IconTarget /> },
  { name: "Fakultas Hukum",         icon: <IconBuilding /> },
];

/* ─────────── Hero 3D Illustration ─────────── */
function HeroIllustration() {
  return (
    <div className="relative flex items-end justify-center flex-shrink-0" style={{ width: "260px", height: "240px" }}>
      {/* Floating icon: lightbulb top-left */}
      <div className="absolute top-6 left-6 z-10 flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/>
          <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
        </svg>
      </div>
      {/* Floating icon: bar chart top-right */}
      <div className="absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      </div>
      {/* Floating icon: pie chart bottom-left */}
      <div className="absolute bottom-14 left-2 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
          <path d="M22 12A10 10 0 0 0 12 2v10z"/>
        </svg>
      </div>

      {/* Main 3D illustration */}
      <svg width="225" height="215" viewBox="0 0 225 215" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Books */}
        <rect x="22" y="168" width="174" height="22" rx="4" fill="#172554"/>
        <rect x="22" y="168" width="9" height="22" rx="3" fill="#1d4ed8"/>
        <rect x="35" y="173" width="55" height="4" rx="2" fill="#60a5fa" opacity="0.4"/>

        <rect x="27" y="148" width="164" height="22" rx="4" fill="#1e3a8a"/>
        <rect x="27" y="148" width="9" height="22" rx="3" fill="#2563eb"/>
        <rect x="40" y="153" width="50" height="4" rx="2" fill="#93c5fd" opacity="0.45"/>

        <rect x="32" y="130" width="154" height="20" rx="4" fill="#1e40af"/>
        <rect x="32" y="130" width="9" height="20" rx="3" fill="#3b82f6"/>
        <rect x="45" y="135" width="44" height="4" rx="2" fill="#bfdbfe" opacity="0.55"/>

        {/* Cap shadow */}
        <ellipse cx="112" cy="133" rx="73" ry="9" fill="#172554" opacity="0.4"/>

        {/* Cap board — 3D isometric */}
        {/* Side face (depth) */}
        <polygon points="112,114 176,87 176,97 112,124 48,97 48,87" fill="#1a3a7a"/>
        {/* Top face */}
        <polygon points="112,76 176,87 112,114 48,87" fill="#1e40af"/>
        {/* Top face highlight */}
        <polygon points="112,76 176,87 133,93 68,82" fill="#2563eb" opacity="0.28"/>

        {/* Hat body */}
        <rect x="98" y="50" width="28" height="28" rx="3" fill="#1e3a8a"/>
        <rect x="95" y="44" width="34" height="10" rx="3" fill="#1e40af"/>
        {/* Button */}
        <circle cx="112" cy="46" r="4" fill="#60a5fa"/>

        {/* Stem + base ball */}
        <rect x="108" y="110" width="8" height="20" rx="2" fill="#172554"/>
        <circle cx="112" cy="130" r="6" fill="#f59e0b"/>

        {/* Tassel string */}
        <line x1="176" y1="87" x2="176" y2="115" stroke="#f59e0b" strokeWidth="2.8"/>
        <circle cx="176" cy="119" r="6" fill="#fbbf24"/>
        <line x1="171" y1="125" x2="168" y2="141" stroke="#f59e0b" strokeWidth="2"/>
        <line x1="176" y1="125" x2="176" y2="143" stroke="#f59e0b" strokeWidth="2"/>
        <line x1="181" y1="125" x2="184" y2="141" stroke="#f59e0b" strokeWidth="2"/>

        {/* Decorative dots */}
        <circle cx="12" cy="105" r="3" fill="white" opacity="0.2"/>
        <circle cx="5" cy="122" r="2" fill="white" opacity="0.15"/>
        <circle cx="215" cy="136" r="3" fill="white" opacity="0.18"/>
      </svg>
    </div>
  );
}

/* ─────────── Main Component ─────────── */
export default function DashboardSiswa() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  });
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboard(); }, []);

  useEffect(() => {
    const onUpdate = () => {
      try { setUser(JSON.parse(localStorage.getItem("user") || "{}")); }
      catch { setUser({}); }
    };
    window.addEventListener("profile-updated", onUpdate);
    return () => window.removeEventListener("profile-updated", onUpdate);
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard`, { headers: authFetchHeaders() });
      if (res.ok) { const d = await res.json(); setProgress(d.progress || null); }
    } catch (e) { console.error(e); }
    finally { setTimeout(() => setLoading(false), 300); }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-sm font-medium text-slate-500">Memuat dashboard siswa...</p>
      </div>
    );
  }

  const pct = progress?.persentase || 67;

  return (
    <div className="pb-6">

      {/* ── Greeting pill ── */}
      <div className="px-6 pt-4 pb-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 shadow-sm px-4 py-2 text-sm font-semibold text-slate-700">
          👋 Selamat Datang, {user.name || "eky"}! 👋
        </div>
      </div>

      {/* ══════════ HERO BANNER ══════════ */}
      <section
        className="mx-6 rounded-2xl overflow-hidden relative"
        style={{
          background: "linear-gradient(120deg, #0d1e72 0%, #1a3acb 50%, #2563eb 100%)",
          minHeight: "245px",
        }}
      >
        {/* decorative rings */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute left-[38%] top-1/2 -translate-y-1/2 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute left-[40%] top-1/2 -translate-y-1/2 h-48 w-48 rounded-full border border-white/10" />
        </div>

        <div className="relative flex items-stretch" style={{ minHeight: "245px" }}>

          {/* Left: text */}
          <div className="flex flex-col justify-center px-8 py-7" style={{ maxWidth: "400px" }}>
            <h1 className="text-[2rem] font-extrabold text-white leading-tight">
              Temukan Jurusan Terbaik
              <br />
              <span className="text-yellow-300">untuk Masa Depanmu</span>
            </h1>
            <p className="mt-3 text-blue-200 text-sm leading-relaxed">
              Sistem Pendukung Keputusan Pemilihan Jurusan menggunakan metode SAW
              berdasarkan nilai akademik, minat, dan bakat siswa.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/siswa/survei"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 shadow transition hover:bg-blue-50"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                Mulai Analisis Jurusan
              </Link>
              <Link
                to="/siswa/hasil"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                <TrendingUp size={15} />
                Lihat Hasil Relomendasi
              </Link>
            </div>
          </div>

          {/* Center: 3D illustration */}
          <div className="hidden md:flex">
            <HeroIllustration />
          </div>

          {/* Right: 4 stat cards horizontal row */}
          <div className="hidden lg:flex flex-1 items-center justify-end gap-3 pr-6">
            {[
              { value: "25+",   label: "Fakultas",             icon: <IconUsers size={30} /> },
              { value: "80+",   label: "Program Studi",        icon: (
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    <line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="13" y2="12"/>
                  </svg>
                )
              },
              { value: "1000+", label: "Siswa Terbantu",       icon: <IconUsers size={30} /> },
              { value: "A",     label: "Akreditasi\nBaik Sekali", icon: <IconAward size={30} /> },
            ].map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-md"
                style={{ width: "98px", minHeight: "130px", gap: "5px", padding: "12px 8px" }}
              >
                <span className="text-blue-600">{s.icon}</span>
                <div className="text-2xl font-extrabold text-blue-700 leading-tight">{s.value}</div>
                <div className="text-[10px] text-slate-500 text-center leading-tight whitespace-pre-line">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ MIDDLE: 3-column grid ══════════ */}
      <div className="px-6 mt-5">
        <div className="grid gap-5 grid-cols-1 md:grid-cols-12">

          {/* Col 1: Progress Kelengkapan Data */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 md:col-span-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-[15px]">Progress Kelengkapan Data</h3>
              <span className="font-extrabold text-blue-600 text-[15px]">{pct}%</span>
            </div>
            <div className="mt-3 h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-4 space-y-3">
              {/* Nilai Rapor */}
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3.5 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 flex-shrink-0">
                  <ClipboardCheck size={18} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">Nilai Rapor</p>
                  <p className="text-xs text-slate-400 mt-0.5">Input nilai akademik selesai</p>
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                  Terisi
                </span>
              </div>
              {/* Survei */}
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3.5 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">Survei Minat & Bakat</p>
                  <p className="text-xs text-slate-400 mt-0.5">Bantu kami memahami kamu</p>
                </div>
                {progress?.has_survei ? (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0">Selesai</span>
                ) : (
                  <span className="text-xs font-semibold text-orange-500 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0">Perlu Diisi</span>
                )}
              </div>
            </div>
          </div>

          {/* Col 2: Rekomendasi Utama */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 md:col-span-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
                Rekomendasi Utama
              </span>
              <Link to="/siswa/hasil" className="text-xs font-semibold text-blue-600 hover:underline">
                Lihat Semua
              </Link>
            </div>
            <h2 className="text-[1.55rem] font-extrabold text-slate-900 leading-tight">
              {progress?.jurusan_utama || "Kedokteran Umum"}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5 mb-4">Fakultas Kedokteran</p>

            {/* Donut LEFT | Faculty list RIGHT */}
            <div className="flex items-center gap-5">
              {/* Donut */}
              <div className="flex-shrink-0">
                <svg width="124" height="124" viewBox="0 0 124 124">
                  <defs>
                    <linearGradient id="donutG" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8"/>
                      <stop offset="100%" stopColor="#1d4ed8"/>
                    </linearGradient>
                  </defs>
                  <circle cx="62" cy="62" r="48" stroke="#e2e8f0" strokeWidth="14" fill="none"/>
                  <circle
                    cx="62" cy="62" r="48"
                    stroke="url(#donutG)" strokeWidth="14" fill="none"
                    strokeLinecap="round"
                    strokeDasharray={Math.PI * 2 * 48}
                    strokeDashoffset={Math.PI * 2 * 48 * (1 - (progress?.persentase || 92) / 100)}
                    transform="rotate(-90 62 62)"
                  />
                  <text x="62" y="59" textAnchor="middle" fontSize="22" fontWeight="800" fill="#1e293b">
                    {progress?.persentase || 92}%
                  </text>
                  <text x="62" y="74" textAnchor="middle" fontSize="9.5" fill="#64748b">
                    Kecocokan
                  </text>
                </svg>
              </div>
              {/* Faculty list */}
              <div className="flex-1 space-y-2.5">
                {FAKULTAS.map((fk, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-blue-600">
                    {fk.icon}
                    <span className="text-sm text-slate-700">{fk.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Col 3: Daftar Fakultas */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 md:col-span-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-[15px]">Daftar Fakultas</h3>
              <Link to="#" className="text-xs font-semibold text-blue-600 hover:underline">
                Lihat Semua
              </Link>
            </div>
            <div className="space-y-0.5">
              {FAKULTAS.map((fk, idx) => (
                <Link
                  key={idx}
                  to="#"
                  className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-slate-50 transition group"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 flex-shrink-0">
                    {fk.icon}
                  </span>
                  <span className="flex-1 text-sm font-medium text-slate-700">{fk.name}</span>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-400 flex-shrink-0"/>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ BOTTOM: Tahapan SPK + Menu Cepat ══════════ */}
      <div className="px-6 mt-5">
        <div className="grid gap-5 grid-cols-1 md:grid-cols-12">

          {/* Tahapan Proses SPK */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 md:col-span-8">
            <h3 className="font-bold text-slate-900 text-[15px]">Tahapan Proses SPK</h3>
            <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center">
              {[
                { n: "1", title: "Input Data",          desc: "Lengkapi data akademik, minat, dan bakat" },
                { n: "2", title: "Proses Analisis",      desc: "Sistem menganalisis menggunakan metode SAW" },
                { n: "3", title: "Hasil Rekomendasi",    desc: "Dapatkan rekomendasi jurusan terbaik untukmu" },
              ].map((step, i) => (
                <div key={i} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center text-center px-3 flex-1">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full text-white text-xl font-extrabold shadow-md"
                      style={{ background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" }}
                    >
                      {step.n}
                    </div>
                    <h4 className="mt-3 text-sm font-bold text-slate-800">{step.title}</h4>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-[130px]">{step.desc}</p>
                  </div>
                  {i < 2 && (
                    <div className="hidden sm:block text-slate-300 flex-shrink-0">
                      <svg width="26" height="14" viewBox="0 0 26 14" fill="none">
                        <path d="M0 7h22M16 1l6 6-6 6" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Menu Cepat */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 md:col-span-4">
            <h3 className="font-bold text-slate-900 text-[15px] mb-4">Menu Cepat</h3>
            <div className="grid grid-cols-4 gap-2">
              {[
                {
                  label: "Survei Minat & Bakat", link: "/siswa/survei",
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="2" width="6" height="4" rx="1"/>
                      <path d="M9 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-2"/>
                      <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
                    </svg>
                  ),
                },
                {
                  label: "Hasil Rekomendasi", link: "/siswa/hasil",
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ),
                },
                {
                  label: "Profil Saya", link: "/siswa/profil",
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  ),
                },
                {
                  label: "Panduan", link: "/siswa/panduan",
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                  ),
                },
              ].map((m, i) => (
                <Link
                  key={i}
                  to={m.link}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-100 px-1 py-4 text-center transition"
                >
                  {m.icon}
                  <span className="text-[10px] font-semibold text-blue-700 leading-tight">{m.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}