import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  User,
  Bell,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  FileText,
  BookOpen,
  PieChart,
  Award,
  TrendingUp,
  ClipboardList,
  Database,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function GuruBKLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuGroups = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/gurubk",
    },
    {
      id: "master",
      label: "Data Master",
      icon: Database,
      children: [
        { id: "users", label: "Kelola User", icon: Users, path: "/gurubk/users" },
        { id: "siswa", label: "Data Siswa", icon: Users, path: "/gurubk/siswa" },
        { id: "jurusan", label: "Data Jurusan", icon: BookOpen, path: "/gurubk/jurusan" },
        { id: "kriteria", label: "Data Kriteria", icon: Settings, path: "/gurubk/kriteria" },
      ],
    },
    {
      id: "survei",
      label: "Survei",
      icon: ClipboardList,
      children: [
        { id: "survei-bakat", label: "Survei Bakat", icon: Award, path: "/gurubk/survei-bakat" },
        { id: "survei-minat", label: "Survei Minat", icon: Award, path: "/gurubk/survei-minat" },
      ],
    },
    {
      id: "penilaian",
      label: "Penilaian",
      icon: PieChart,
      children: [
        { id: "nilai", label: "Nilai Rapor", icon: FileText, path: "/gurubk/nilai-rapor" },
               { id: "saw-process", label: "Proses SAW", icon: TrendingUp, path: "/gurubk/saw-process" },
        { id: "laporan", label: "Laporan Hasil", icon: FileText, path: "/gurubk/laporan" },
      ],
    },
  ];
  const [openGroups, setOpenGroups] = useState({
    master: true,
    survei: true,
    penilaian: true,
    hasil: true,
  });

  const toggleGroup = (id) => {
    setOpenGroups((current) => ({ ...current, [id]: !current[id] }));
  };

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
    if (user.role !== "guru_bk") {
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "siswa") navigate("/siswa");
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 font-bold text-white shadow-lg">
                A
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800">
                Admin<span className="text-sky-600">Panel</span>
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

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
          {menuGroups.map((item) => {
            const children = item.children || [];
            const isGroup = children.length > 0;
            const isActive = isGroup
              ? children.some((child) => location.pathname === child.path)
              : location.pathname === item.path;

            if (!isGroup) {
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`group flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-200 ${
                    isActive
                      ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <item.icon size={22} className={isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900"} />
                  {isSidebarOpen && <span className="font-semibold">{item.label}</span>}
                </Link>
              );
            }

            return (
              <div key={item.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(item.id)}
                  className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-all duration-200 ${
                    isActive ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <item.icon size={22} className={isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-900"} />
                  {isSidebarOpen && <span className="font-semibold">{item.label}</span>}
                  {isSidebarOpen && (
                    openGroups[item.id] ? <ChevronDown size={16} className="ml-auto" /> : <ChevronRight size={16} className="ml-auto" />
                  )}
                </button>

                {isSidebarOpen && openGroups[item.id] && (
                  <div className="space-y-1 pl-4">
                    {children.map((child) => {
                      const isChildActive = location.pathname === child.path;
                      return (
                        <Link
                          key={child.id}
                          to={child.path}
                          className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all duration-200 ${
                            isChildActive
                              ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <child.icon size={18} className={isChildActive ? "text-white" : "text-slate-400 group-hover:text-slate-900"} />
                          <span className="font-semibold">{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
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
                <p className="text-sm font-bold text-slate-800">{user.name || "Administrator"}</p>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Role: {user.role || "Admin"}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 ring-4 ring-slate-50">
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
