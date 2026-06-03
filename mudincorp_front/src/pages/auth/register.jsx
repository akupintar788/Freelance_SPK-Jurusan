import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../services/authService.js";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    nip: "",
    password: "",
    password_confirmation: "",
    role: "siswa",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.password_confirmation) {
      setError("Konfirmasi password tidak cocok.");
      setLoading(false);
      return;
    }

    try {
      const data = await register(formData);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === "admin") navigate("/admin");
      else if (data.user.role === "guru_bk") navigate("/gurubk");
      else navigate("/siswa");
    } catch (err) {
      const messages = err.response?.data;
      if (typeof messages === "object") {
        setError(Object.values(messages).flat()[0]);
      } else {
        setError("Registrasi gagal. Pastikan NIP belum terdaftar.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 text-slate-900">
      <div className="grid w-full max-w-6xl gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        <section className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-2xl shadow-slate-200/40">
          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">
            Daftar Akun
          </span>
          <h1 className="mt-6 text-4xl font-semibold text-slate-950">
            Buat Akun Baru
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
            Daftar sebagai pengguna untuk mengelola proses SAW, data siswa, dan
            rekomendasi jurusan dengan antarmuka profesional.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Keamanan</p>
              <p className="mt-2 text-sm text-slate-500">
                Standar terbaik untuk perlindungan data pengguna.
              </p>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">
                Akses penuh
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Kelola semua modul sistem dari satu dashboard.
              </p>
            </div>
          </div>
        </section>

        <section className="auth-card rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-600">
                Registrasi
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950">
                Mulai dengan mudah
              </h2>
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
                {error}
              </div>
            )}

            <label className="block text-sm text-slate-700">
              <span className="mb-2 block text-sm font-semibold">
                Nama Lengkap
              </span>
              <input
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Nama lengkap"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm text-slate-700">
                <span className="mb-2 block text-sm font-semibold">NIP / NISN</span>
                <input
                  name="nip"
                  type="text"
                  required
                  value={formData.nip}
                  onChange={handleChange}
                  placeholder="12345678"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </label>
              <label className="block text-sm text-slate-700">
                <span className="mb-2 block text-sm font-semibold">Role</span>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="siswa">Siswa</option>
                  <option value="guru_bk">Guru BK</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            </div>

            {formData.role === "siswa" && (
              <div className="grid grid-cols-2 gap-4">
                <label className="block text-sm text-slate-700">
                  <span className="mb-2 block text-sm font-semibold">Kelas</span>
                  <input
                    name="kelas"
                    type="text"
                    required
                    value={formData.kelas || ""}
                    onChange={handleChange}
                    placeholder="XII-IPA-1"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
                <label className="block text-sm text-slate-700">
                  <span className="mb-2 block text-sm font-semibold">Jurusan</span>
                  <input
                    name="jurusan"
                    type="text"
                    value={formData.jurusan || ""}
                    onChange={handleChange}
                    placeholder="IPA / IPS"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
              </div>
            )}

            <label className="block text-sm text-slate-700">
              <span className="mb-2 block text-sm font-semibold">Password</span>
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block text-sm text-slate-700">
              <span className="mb-2 block text-sm font-semibold">Konfirmasi Password</span>
              <input
                name="password_confirmation"
                type="password"
                required
                value={formData.password_confirmation}
                onChange={handleChange}
                placeholder="••••••••"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Buat akun"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Sudah punya akun?{" "}
            <Link
              to="/auth/login"
              className="font-semibold text-sky-600 hover:text-sky-700"
            >
              Masuk
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
