import { Award, Bell, Compass, Lock, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function SiswaLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  });

  // Cek apakah bakat sudah selesai (dari localStorage)
  const getBakatKey = () => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return `survei_bakat_selesai_${u.id || "guest"}`;
    } catch {
      return "survei_bakat_selesai_guest";
    }
  };
  const [bakatSelesai, setBakatSelesai] = useState(
    () => localStorage.getItem(getBakatKey()) === "1"
  );

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      path: "/siswa",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
      ),
    },
    {
      id: "survei-bakat",
      label: "Survei Bakat",
      path: "/siswa/survei/bakat",
      icon: <Award size={16} />,
    },
    {
      id: "survei-minat",
      label: "Survei Minat",
      path: "/siswa/survei/minat",
      icon: <Compass size={16} />,
    },
    {
      id: "hasil",
      label: "Hasil Rekomendasi",
      path: "/siswa/hasil",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
        </svg>
      ),
    },
    {
      id: "profil",
      label: "Profil Saya",
      path: "/siswa/profil",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
    {
      id: "panduan",
      label: "Panduan",
      path: "/siswa/panduan",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      ),
    },
  ];

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/auth/login");
      return;
    }
    let currentUser = {};
    try {
      currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    } catch {}
    if (currentUser.role !== "siswa") {
      if (currentUser.role === "admin") navigate("/admin");
      else if (currentUser.role === "guru_bk") navigate("/gurubk");
      else navigate("/auth/login");
    }
  }, [navigate]);

  // Refresh bakatSelesai setiap kali route berubah
  useEffect(() => {
    setBakatSelesai(localStorage.getItem(getBakatKey()) === "1");
  }, [location.pathname]);

  useEffect(() => {
    const handleProfileUpdate = () => {
      try {
        setUser(JSON.parse(localStorage.getItem("user") || "{}"));
      } catch {
        setUser({});
      }
    };
    window.addEventListener("profile-updated", handleProfileUpdate);
    return () => window.removeEventListener("profile-updated", handleProfileUpdate);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/auth/login");
  };

  return (
    <div className="flex min-h-screen bg-[#f0f4fb] font-sans text-slate-900">
      {/* ── Sidebar ── */}
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0f2167] text-white shadow-2xl transition-all duration-300 ease-in-out`}
      >
        {/* ── Logo ── */}
        <div className="flex h-20 items-center px-5 border-b border-white/10">
          {isSidebarOpen ? (
            <div className="flex items-center gap-3">
              {/* Shield icon */}
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z" fill="white" fillOpacity="0.9"/>
                  <path d="M9 12L11 14L15 10" stroke="#0f2167" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white leading-tight tracking-wide">
                  UNIVERSAL
                </h2>
                <p className="text-[10px] text-blue-300 leading-tight">
                  Sistem Pendukung Keputusan
                </p>
              </div>
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 mx-auto">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z" fill="white"/>
              </svg>
            </div>
          )}
        </div>

        {/* ── Nav items ── */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {menuItems.map((item) => {
          const isActive =
            item.path === "/siswa"
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

          // Khusus menu Survei Minat: terkunci jika bakat belum selesai
          const isMinatMenu = item.id === "survei-minat";
          const isLocked = isMinatMenu && !bakatSelesai;

          if (isLocked) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  Swal.fire({
                    icon: "warning",
                    title: "Selesaikan Survei Bakat Dulu",
                    text: "Anda harus menyelesaikan survei bakat sebelum dapat mengakses survei minat.",
                    confirmButtonColor: "#7c3aed",
                    confirmButtonText: "Ke Survei Bakat",
                  }).then(() => navigate("/siswa/survei/bakat"))
                }
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-blue-300/50 cursor-not-allowed transition-all duration-150"
              >
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-blue-300/50">
                  <Lock size={15} />
                </span>
                {isSidebarOpen && (
                  <span className="flex-1 text-sm font-medium text-left">
                    {item.label}
                    <span className="ml-1.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full">
                      Terkunci
                    </span>
                  </span>
                )}
              </button>
            );
          }

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-blue-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
                  isActive ? "text-white" : "text-blue-300 group-hover:text-white"
                }`}>
                  {item.icon}
                </span>
                {isSidebarOpen && (
                  <span className="flex-1 text-sm font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Bottom Illustration ── */}
        {isSidebarOpen && (
          <div className="px-3 pb-2 pt-2 flex flex-col items-center">
            {/* 3D Graduation Cap + Books Illustration */}
            <svg width="180" height="165" viewBox="0 0 180 165" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* ── Books Stack ── */}
              {/* Bottom book */}
              <rect x="18" y="130" width="118" height="18" rx="3" fill="#1a3a7a"/>
              <rect x="18" y="130" width="7" height="18" rx="2" fill="#1d4ed8"/>
              <rect x="28" y="134" width="40" height="3" rx="1.5" fill="#93c5fd" opacity="0.5"/>
              {/* Middle book */}
              <rect x="22" y="112" width="112" height="20" rx="3" fill="#1e40af"/>
              <rect x="22" y="112" width="7" height="20" rx="2" fill="#2563eb"/>
              <rect x="32" y="116" width="38" height="3" rx="1.5" fill="#93c5fd" opacity="0.5"/>
              {/* Top book */}
              <rect x="26" y="96" width="105" height="18" rx="3" fill="#2563eb"/>
              <rect x="26" y="96" width="7" height="18" rx="2" fill="#3b82f6"/>
              <rect x="36" y="100" width="35" height="3" rx="1.5" fill="#bfdbfe" opacity="0.6"/>

              {/* ── Graduation Cap ── */}
              {/* Cap shadow/depth bottom */}
              <ellipse cx="80" cy="96" rx="60" ry="9" fill="#1a3a7a" opacity="0.5"/>
              {/* Cap board (top face - parallelogram for 3D) */}
              <polygon points="80,56 132,80 80,96 28,80" fill="#1e3a8a"/>
              {/* Cap board highlight */}
              <polygon points="80,56 132,80 80,68 28,80" fill="#2563eb" opacity="0.35"/>
              {/* Cap top hat */}
              <rect x="68" y="38" width="24" height="20" rx="2" fill="#1e3a8a"/>
              <rect x="66" y="34" width="28" height="8" rx="2" fill="#1e40af"/>
              {/* Top button */}
              <circle cx="80" cy="37" r="3" fill="#60a5fa"/>
              {/* Cap stem */}
              <rect x="77" y="88" width="6" height="14" rx="2" fill="#1a3a7a"/>
              <circle cx="80" cy="102" r="4" fill="#f59e0b"/>

              {/* ── Tassel ── */}
              <line x1="132" y1="80" x2="132" y2="104" stroke="#f59e0b" strokeWidth="2.5"/>
              <circle cx="132" cy="107" r="5" fill="#fbbf24"/>
              <line x1="128" y1="112" x2="125" y2="126" stroke="#f59e0b" strokeWidth="1.8"/>
              <line x1="132" y1="112" x2="132" y2="128" stroke="#f59e0b" strokeWidth="1.8"/>
              <line x1="136" y1="112" x2="139" y2="126" stroke="#f59e0b" strokeWidth="1.8"/>

              {/* ── Decorative White Plant/Leaves (right side) ── */}
              <path d="M148 130 Q162 115 168 128 Q160 120 148 130Z" fill="white" opacity="0.55"/>
              <path d="M152 140 Q168 123 175 138 Q165 128 152 140Z" fill="white" opacity="0.45"/>
              <path d="M150 150 Q165 137 170 150 Q162 143 150 150Z" fill="white" opacity="0.40"/>
              <path d="M155 158 Q170 147 175 158 Q166 152 155 158Z" fill="white" opacity="0.35"/>
              {/* stem */}
              <line x1="153" y1="158" x2="158" y2="132" stroke="white" strokeWidth="1.2" opacity="0.4"/>
            </svg>

            {/* Text */}
            <p className="text-sm font-bold text-white text-center leading-snug -mt-1">
              Tumbuh, Belajar,
            </p>
            <p className="text-sm font-bold text-white text-center leading-snug">
              Berkontriburi untuk Negeri
            </p>
            <p className="text-xs text-blue-300 text-center leading-tight mt-1.5 px-2">
              Temukan jurusan terbaik untuk masa depanmu.
            </p>
          </div>
        )}

        {/* ── Logout ── */}
        <div className="px-3 pb-4 pt-2">
          <button
            onClick={handleLogout}
            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-blue-300 transition hover:bg-white/10 hover:text-white ${
              !isSidebarOpen ? "justify-center" : ""
            }`}
          >
            <LogOut size={16} className="flex-shrink-0" />
            {isSidebarOpen && (
              <span className="text-sm font-medium">Keluar</span>
            )}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main
        className={`${
          isSidebarOpen ? "ml-64" : "ml-20"
        } flex-1 transition-all duration-300 ease-in-out`}
      >
        {/* ── Topbar ── */}
        <header
          className="fixed top-0 right-0 z-40 flex h-12 items-center justify-end gap-4 px-6 bg-[#f0f4fb]"
          style={{ left: isSidebarOpen ? "16rem" : "5rem" }}
        >
          {/* Bell */}
          <button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 transition hover:bg-slate-50 shadow-sm">
            <Bell size={17} />
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-[#f0f4fb]">
              2
            </span>
          </button>

          <div className="h-6 w-px bg-slate-200" />

          {/* User info */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-slate-800 leading-tight">
                {user.name || "eky"}
              </p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {user.role || "SISWA"}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-white shadow-sm border-2 border-white overflow-hidden flex-shrink-0">
              {user.foto ? (
                <img
                  src={`http://localhost:8000/storage/${user.foto}`}
                  alt={user.name || "Foto Profil"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User size={17} />
              )}
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </header>
        {/* Page Content */}
        <div className="pt-7">{children}</div>
      </main>
    </div>
  );
}