import {
  LayoutDashboard,
  ClipboardList,
  Award,
  LogOut,
  User,
  Bell,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function SiswaLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/siswa",
    },
    {
      id: "survei",
      label: "Survei Minat",
      icon: ClipboardList,
      path: "/siswa/survei",
    },
    {
      id: "hasil",
      label: "Hasil Rekomendasi",
      icon: Award,
      path: "/siswa/hasil",
    },
  ];

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/auth/login");
      return;
    }
    let user = {};
    try {
      user = JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      /* ignore */
    }
    if (user.role !== "siswa") {
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "guru_bk") navigate("/gurubk");
      else navigate("/auth/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/auth/login");
  };

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch (e) {
    console.error("Failed to parse user data", e);
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "w-72" : "w-20"
        } fixed bottom-0 left-0 top-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out`}
      >
        <div className="flex h-20 items-center justify-between px-6">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 font-bold text-white shadow-lg shadow-sky-200">
                M
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800">
                Mudin<span className="text-sky-600">Corp</span>
              </span>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-200 ${
                  isActive
                    ? "bg-sky-600 text-white shadow-lg shadow-sky-100"
                    : "text-slate-500 hover:bg-slate-50 hover:text-sky-600"
                }`}
              >
                <item.icon
                  size={22}
                  className={isActive ? "text-white" : "text-slate-400 group-hover:text-sky-600"}
                />
                {isSidebarOpen && (
                  <span className="font-semibold">{item.label}</span>
                )}
                {isSidebarOpen && isActive && (
                  <ChevronRight size={16} className="ml-auto opacity-70" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-slate-500 transition-all hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut size={22} className="text-slate-400 group-hover:text-rose-600" />
            {isSidebarOpen && <span className="font-semibold">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`${
          isSidebarOpen ? "ml-72" : "ml-20"
        } flex-1 transition-all duration-300 ease-in-out`}
      >
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200/60 bg-white/80 px-8 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-800 capitalize">
              {location.pathname.split("/").pop() || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition hover:bg-slate-100">
              <Bell size={20} />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            </button>
            
            <div className="h-8 w-px bg-slate-200"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800">{user.name || "Siswa Account"}</p>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Role: {user.role || "Siswa"}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 ring-4 ring-sky-50">
                <User size={22} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
