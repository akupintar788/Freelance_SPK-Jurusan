export default function Badge({ color, children }) {
  const base = "inline-flex rounded-full px-3 py-1 text-[11px] font-semibold";
  const colors = {
    green: "bg-emerald-100 text-emerald-700",
    blue: "bg-sky-100 text-sky-700",
    amber: "bg-amber-100 text-amber-800",
    purple: "bg-violet-100 text-violet-700",
  };

  return (
    <span className={`${base} ${colors[color] || colors.blue}`}>
      {children}
    </span>
  );
}
