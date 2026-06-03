export default function LoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <h3 className="text-2xl font-semibold text-slate-900">SPK Prodi</h3>
        <p className="mt-2 text-sm text-slate-500">
          Sistem Pendukung Keputusan — Universitas PGRI Madiun
        </p>
        <div className="mt-8 space-y-4">
          <label className="block text-sm text-slate-600">
            <span className="mb-2 block">Username</span>
            <input
              type="text"
              defaultValue="admin"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400"
              placeholder="Masukkan username"
            />
          </label>
          <label className="block text-sm text-slate-600">
            <span className="mb-2 block">Password</span>
            <input
              type="password"
              defaultValue="password"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400"
              placeholder="Masukkan password"
            />
          </label>
          <p className="text-right text-sm text-sky-600">Lupa password?</p>
          <button className="mt-4 w-full rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700">
            Masuk ke Sistem
          </button>
        </div>
      </div>
    </div>
  );
}
