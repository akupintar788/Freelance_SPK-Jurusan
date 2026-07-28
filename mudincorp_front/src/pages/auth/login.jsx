import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authService.js";

export default function LoginPage() {
  const [nip, setNip] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(nip, password);
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("Login Success, User Data:", data.user);

      if (data.user.role === "admin") {
        navigate("/admin");
      } else if (data.user.role === "guru_bk") {
        navigate("/gurubk");
      } else if (data.user.role === "siswa") {
        navigate("/siswa");
      } else {
        console.warn("Unknown role:", data.user.role);
        navigate("/");
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Login gagal. Cek NIP dan password.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 text-slate-900">
      <div className="grid w-full max-w-6xl gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <section className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-2xl shadow-slate-200/40">
          <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">
            Admin Panel
          </span>
          <h1 className="mt-6 text-4xl font-semibold text-slate-950">
            Masuk sebagai Administrator
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
            Kelola data siswa, kriteria, bobot, dan hasil rekomendasi prodi
            dengan antarmuka yang bersih dan mudah digunakan.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Keamanan</p>
              <p className="mt-2 text-sm text-slate-500">
                Login aman dan perlindungan akses administrator.
              </p>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">
                Kontrol Penuh
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Akses seluruh modul dalam satu dashboard terpadu.
              </p>
            </div>
          </div>
        </section>

        <section className="auth-card rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-600">
                Masuk
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950">
                Akses Dashboard
              </h2>
            </div>
            {error && (
              <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}
            <label className="block text-sm text-slate-700">
              <span className="mb-2 block text-sm font-semibold">NIP</span>
              <input
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="Masukkan NIP"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </label>
            <label className="block text-sm text-slate-700">
              <span className="mb-2 block text-sm font-semibold">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Memeriksa..." : "Masuk"}
            </button>
          </form>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Akun siswa hanya dibuat oleh Guru BK atau Admin. Silakan hubungi
            pihak sekolah untuk pendaftaran.
          </div>
        </section>
      </div>
    </main>
  );
}
