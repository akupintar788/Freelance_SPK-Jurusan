import { navItems } from "./adminData.js";

export default function AdminSidebar({ activePage, onChangePage }) {
  return (
    <aside className="w-[260px] flex-shrink-0 bg-slate-950 text-slate-300 shadow-lg shadow-slate-950/10">
      <div className="border-b border-slate-800 px-6 py-6">
        <div className="text-sm font-black tracking-tight text-white">
          SPK PRODI
        </div>
        <div className="mt-2 text-[10px] uppercase tracking-[0.24em] text-slate-500">
          UNIPMA · Sistem SAW
        </div>
      </div>
      <nav className="space-y-1 px-2 py-4">
        {navItems
          .reduce((sections, item) => {
            const last = sections[sections.length - 1];
            if (!last || last.section !== item.section) {
              sections.push({ section: item.section, items: [item] });
            } else {
              last.items.push(item);
            }
            return sections;
          }, [])
          .map((group) => (
            <div key={group.section}>
              <div className="px-3 pb-2 pt-4 text-[10px] uppercase tracking-[0.25em] text-slate-500">
                {group.section}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onChangePage(item.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition ${activePage === item.id ? "bg-slate-800 text-sky-400" : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"}`}
                  >
                    <span className="h-3.5 w-3.5 rounded-full bg-current opacity-70" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
      </nav>
      <div className="mt-auto border-t border-slate-800 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-violet-500 text-sm font-bold text-white">
            AD
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold text-slate-100">
              Administrator
            </p>
            <p className="truncate text-xs uppercase text-slate-500">
              Super Admin
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
