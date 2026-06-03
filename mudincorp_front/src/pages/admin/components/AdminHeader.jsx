import { pageTitles } from "../adminData.js";

export default function AdminHeader({ activePage }) {
  const [title, subtitle] = pageTitles[activePage] || pageTitles.dashboard;

  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 bg-white/95 px-6 py-5 shadow-sm shadow-slate-900/5 backdrop-blur-sm lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-base font-semibold tracking-tight text-slate-900">
          {title}
        </p>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
          Super Admin
        </div>
        <button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
          Logout
        </button>
      </div>
    </header>
  );
}
