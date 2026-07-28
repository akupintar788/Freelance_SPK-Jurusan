import { useEffect, useMemo, useState } from "react";
import {
  createNilaiRapor,
  deleteNilaiRapor,
  fetchNilaiRapor,
} from "../../services/nilaiRaporService.js";
import { fetchSiswa } from "../../services/siswaService.js";
import { updateUser } from "../../services/userService.js";
import Swal from "sweetalert2";

// ── Icon components (inline SVG, no deps) ──────────────────────────
const Icon = {
  X: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  ChevronDown: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Book: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Plus: () => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M7.5 2v11M2 7.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  User: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Award: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="10" r="6" stroke="currentColor" strokeWidth="2" />
      <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Filter: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M22 3H2l8 9.46V19l4 2V12.46L22 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  CheckCircle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

// ── Grade color helper ───────────────────────────────────────────────
function gradeColor(nilai) {
  const n = Number(nilai);
  if (n >= 85) return { bg: "#dcfce7", text: "#15803d", label: "A" };
  if (n >= 75) return { bg: "#dbeafe", text: "#1d4ed8", label: "B" };
  if (n >= 65) return { bg: "#fef9c3", text: "#a16207", label: "C" };
  return { bg: "#fee2e2", text: "#b91c1c", label: "D" };
}

// ── Reusable Select ──────────────────────────────────────────────────
function Select({ label, value, onChange, children, required, className = "" }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</span>}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          required={required}
          className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon.ChevronDown />
        </span>
      </div>
    </label>
  );
}

// ── Rapor Detail Popup ───────────────────────────────────────────────
function RaporDetailModal({ student, rapor, onClose, onDelete, onAddClick }) {
  const total = rapor.reduce((s, i) => s + (Number(i.nilai) || 0), 0);
  const avg = rapor.length ? (total / rapor.length).toFixed(2) : "-";
  const avgGrade = rapor.length ? gradeColor(avg) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-[28px] bg-white shadow-2xl"
        style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div
          className="relative overflow-hidden px-8 pt-8 pb-6"
          style={{
            background: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e40af 100%)",
          }}
        >
          {/* decorative circles */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />
          <div className="pointer-events-none absolute -bottom-8 left-1/3 h-40 w-40 rounded-full opacity-5"
            style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-white/20 text-white">
                  <Icon.Book />
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest text-blue-200">
                  Rapor Siswa
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white">{student?.nama}</h2>
              <div className="mt-2 flex flex-wrap gap-3">
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-blue-100">
                  NISN: {student?.nisn}
                </span>
                {student?.kelas && (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-blue-100">
                    Kelas {student.kelas}
                  </span>
                )}
                {student?.jurusan && (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-blue-100">
                    {student.jurusan}
                  </span>
                )}
              </div>
            </div>

            {/* Avg badge */}
            {avgGrade && (
              <div className="shrink-0 text-center">
                <div
                  className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl shadow-lg"
                  style={{ background: avgGrade.bg, color: avgGrade.text }}
                >
                  <span className="text-xl font-black">{avgGrade.label}</span>
                  <span className="text-[10px] font-bold opacity-80">{avg}</span>
                </div>
                <p className="mt-1 text-[10px] font-medium text-blue-200">Rata-rata</p>
              </div>
            )}
          </div>

          {/* Summary pills */}
          <div className="mt-5 flex flex-wrap gap-4">
            <div className="rounded-2xl bg-white/10 px-4 py-2 text-center">
              <div className="text-xl font-bold text-white">{rapor.length}</div>
              <div className="text-[11px] text-blue-200">Mata Pelajaran</div>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-2 text-center">
              <div className="text-xl font-bold text-white">{total}</div>
              <div className="text-[11px] text-blue-200">Total Nilai</div>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-2 text-center">
              <div className="text-xl font-bold text-white">{avg}</div>
              <div className="text-[11px] text-blue-200">Rata-rata</div>
            </div>
          </div>

          {/* close btn */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-white transition hover:bg-white/30"
          >
            <Icon.X />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Daftar Nilai</h3>
            <button
              onClick={onAddClick}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Icon.Plus />
              Tambah Nilai
            </button>
          </div>

          {rapor.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-14 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Icon.Book />
              </div>
              <p className="text-sm font-medium text-slate-500">Belum ada nilai rapor</p>
              <p className="mt-1 text-xs text-slate-400">Klik tombol Tambah Nilai untuk mulai</p>
            </div>
          ) : (
            <div className="space-y-2">
              {rapor.map((item, idx) => {
                const g = gradeColor(item.nilai);
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:border-slate-200 hover:bg-white hover:shadow-sm"
                  >
                    <span className="w-6 shrink-0 text-center text-xs font-bold text-slate-400">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {item.mata_pelajaran}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Sem {item.semester} · {item.tahun_ajaran}
                      </p>
                    </div>
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black"
                      style={{ background: g.bg, color: g.text }}
                    >
                      {item.nilai}
                    </div>
                    <div
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-black"
                      style={{ background: g.bg, color: g.text }}
                    >
                      {g.label}
                    </div>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500 transition hover:bg-rose-100"
                    >
                      <Icon.Trash />
                    </button>
                  </div>
                );
              })}

              {/* Footer summary */}
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-indigo-50 px-5 py-3">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">
                  Nilai Rata-rata
                </span>
                <div className="flex items-center gap-2">
                  {avgGrade && (
                    <span
                      className="rounded-lg px-2 py-0.5 text-xs font-black"
                      style={{ background: avgGrade.bg, color: avgGrade.text }}
                    >
                      {avgGrade.label}
                    </span>
                  )}
                  <span className="text-xl font-black text-indigo-700">{avg}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tambah Rapor Modal ───────────────────────────────────────────────
function TambahRaporModal({ student, formRapor, setFormRapor, onSubmit, onClose, error }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)" }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div
          className="px-6 py-5"
          style={{ background: "linear-gradient(135deg, #1e293b, #1e40af)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">
                Input Nilai
              </p>
              <h3 className="mt-0.5 text-lg font-bold text-white">Tambah Nilai Rapor</h3>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-white hover:bg-white/30"
            >
              <Icon.X />
            </button>
          </div>
          {student && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-1.5 text-xs font-medium text-blue-100">
              <Icon.User />
              {student.nama} — {student.nisn}
            </div>
          )}
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <Select
            label="Mata Pelajaran"
            value={formRapor.mata_pelajaran}
            onChange={(e) => setFormRapor((p) => ({ ...p, mata_pelajaran: e.target.value }))}
            required
          >
            <option value="" disabled>Pilih Mata Pelajaran</option>
            <optgroup label="Umum">
              <option value="Pendidikan Agama">Pendidikan Agama</option>
              <option value="PPKn">PPKn</option>
              <option value="Bahasa Indonesia">Bahasa Indonesia</option>
              <option value="Bahasa Inggris">Bahasa Inggris</option>
              <option value="Matematika Peminatan">Matematika</option>
              <option value="Sejarah Indonesia">Sejarah Indonesia</option>
              <option value="Seni Budaya">Seni Budaya</option>
              <option value="PJOK">PJOK</option>
              <option value="Prakarya dan Kewirausahaan">Prakarya dan Kewirausahaan</option>
              <option value="Informatika/TIK">Informatika/TIK</option>
            </optgroup>
            <optgroup label="IPA">
              <option value="Fisika">Fisika</option>
              <option value="Kimia">Kimia</option>
              <option value="Biologi">Biologi</option>
            </optgroup>
            <optgroup label="IPS">
              <option value="Ekonomi">Ekonomi</option>
              <option value="Geografi">Geografi</option>
              <option value="Sosiologi">Sosiologi</option>
              <option value="Sejarah Peminatan">Sejarah Peminatan</option>
            </optgroup>
          </Select>

          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">Nilai</span>
              <input
                value={formRapor.nilai}
                onChange={(e) => setFormRapor((p) => ({ ...p, nilai: e.target.value }))}
                type="number" min="0" max="100" step="0.01"
                placeholder="0–100"
                required
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </label>

            <Select
              label="Semester"
              value={formRapor.semester}
              onChange={(e) => setFormRapor((p) => ({ ...p, semester: e.target.value }))}
              required
            >
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </Select>

            <Select
              label="Tahun Ajaran"
              value={formRapor.tahun_ajaran}
              onChange={(e) => setFormRapor((p) => ({ ...p, tahun_ajaran: e.target.value }))}
              required
            >
              <option value="" disabled>Pilih</option>
              <option value="2024/2025">2024/2025</option>
              <option value="2025/2026">2025/2026</option>
              <option value="2026/2027">2026/2027</option>
            </Select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 rounded-2xl bg-indigo-600 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              Simpan Nilai
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Kelola Siswa Modal ───────────────────────────────────────────────
function KelolaModal({ students, classOptions, selectedStudentId, formData, formError, saving, onSelect, onChange, onSubmit, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)" }}
    >
      <div className="w-full max-w-xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div
          className="px-6 py-5"
          style={{ background: "linear-gradient(135deg, #0f172a, #1e40af)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">
                Manajemen
              </p>
              <h3 className="mt-0.5 text-lg font-bold text-white">Kelola Data Siswa</h3>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-white hover:bg-white/30"
            >
              <Icon.X />
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {formError}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Pilih Siswa"
              value={selectedStudentId}
              onChange={(e) => onSelect(e.target.value)}
              required
            >
              <option value="">— Pilih Siswa —</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama} · {s.nisn}
                </option>
              ))}
            </Select>

            <Select
              label="Kelas"
              value={formData.kelas}
              onChange={(e) => onChange("kelas", e.target.value)}
              required
            >
              <option value="">Pilih Kelas</option>
              {classOptions.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </Select>
          </div>

          <Select
            label="Jurusan"
            value={formData.jurusan}
            onChange={(e) => onChange("jurusan", e.target.value)}
            required
          >
            <option value="">Pilih Jurusan</option>
            <option value="IPA">IPA</option>
            <option value="IPS">IPS</option>
          </Select>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-2xl bg-indigo-600 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────
export default function SiswaPage() {
  const [students, setStudents] = useState([]);
  const [nilaiRapor, setNilaiRapor] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Kelola modal
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [formData, setFormData] = useState({ password: "", kelas: "", jurusan: "" });
  const [formError, setFormError] = useState("");

  // Rapor detail popup
  const [raporDetailId, setRaporDetailId] = useState("");

  // Tambah rapor modal (can open from detail or table)
  const [raporModalOpen, setRaporModalOpen] = useState(false);
  const [activeRaporStudentId, setActiveRaporStudentId] = useState("");
  const [formRapor, setFormRapor] = useState({
    siswa_id: "", mata_pelajaran: "", nilai: "", semester: "1", tahun_ajaran: "2024/2025",
  });

  // Filters
  const [filterKelas, setFilterKelas] = useState("");
  const [filterMataPelajaran, setFilterMataPelajaran] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [filterTahunAjaran, setFilterTahunAjaran] = useState("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [userData, nilaiData] = await Promise.all([fetchSiswa(), fetchNilaiRapor()]);
      setStudents(userData);
      setNilaiRapor(nilaiData);
      if (userData.length > 0) setFormRapor((c) => ({ ...c, siswa_id: userData[0].id }));
    } catch {
      setError("Gagal memuat data siswa atau nilai rapor. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  }

  function showSuccess(msg) {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  }

  const studentsWithAverage = useMemo(() =>
    students.map((s) => {
      const scores = nilaiRapor.filter((i) => Number(i.siswa_id) === Number(s.id)).map((i) => Number(i.nilai) || 0);
      return { ...s, rata_rata: scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : "-" };
    }),
  [students, nilaiRapor]);

  const classOptions = useMemo(() => {
    const defaults = ["10 IPA", "10 IPS", "11 IPA", "11 IPS", "12 IPA", "12 IPS"];
    return [...new Set([...students.map((s) => s.kelas).filter(Boolean), ...defaults])];
  }, [students]);

  const uniqueSubjects = useMemo(() => [...new Set(nilaiRapor.map((i) => i.mata_pelajaran).filter(Boolean))], [nilaiRapor]);
  const uniqueTahunAjaran = useMemo(() => [...new Set(nilaiRapor.map((i) => i.tahun_ajaran).filter(Boolean))], [nilaiRapor]);

  const filteredStudents = useMemo(() =>
    studentsWithAverage.filter((student) => {
      if (filterKelas && student.kelas !== filterKelas) return false;
      const sr = nilaiRapor.filter((i) => Number(i.siswa_id) === Number(student.id));
      if (filterMataPelajaran && !sr.some((i) => i.mata_pelajaran === filterMataPelajaran)) return false;
      if (filterSemester && !sr.some((i) => String(i.semester) === String(filterSemester))) return false;
      if (filterTahunAjaran && !sr.some((i) => i.tahun_ajaran === filterTahunAjaran)) return false;
      return true;
    }),
  [studentsWithAverage, nilaiRapor, filterKelas, filterMataPelajaran, filterSemester, filterTahunAjaran]);

  const raporDetailStudent = useMemo(() => students.find((s) => Number(s.id) === Number(raporDetailId)), [students, raporDetailId]);
  const raporDetailData = useMemo(() => raporDetailId ? nilaiRapor.filter((i) => Number(i.siswa_id) === Number(raporDetailId)) : [], [nilaiRapor, raporDetailId]);
  const activeRaporStudent = useMemo(() => students.find((s) => Number(s.id) === Number(activeRaporStudentId)), [students, activeRaporStudentId]);

  const handleStudentSelect = (id) => {
    const s = students.find((item) => Number(item.id) === Number(id));
    setSelectedStudentId(id);
    setFormData({ password: "", kelas: s?.kelas || "", jurusan: s?.jurusan || "" });
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) { setFormError("Pilih siswa terlebih dahulu."); return; }
    setSaving(true); setFormError("");
    try {
      await updateUser(selectedStudentId, {
        role: "siswa", kelas: formData.kelas, jurusan: formData.jurusan,
        ...(formData.password ? { password: formData.password } : {}),
      });
      setModalOpen(false);
      setSelectedStudentId("");
      setFormData({ password: "", kelas: "", jurusan: "" });
      await loadData();
      showSuccess("Data siswa berhasil diperbarui.");
    } catch (err) {
      const message = err?.response?.data?.message ?? err?.message;
      setFormError(typeof message === "string" ? message : "Gagal menyimpan siswa.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitRapor = async (e) => {
    e.preventDefault();
    try {
      setError("");
      const created = await createNilaiRapor({
        ...formRapor, siswa_id: Number(formRapor.siswa_id), semester: Number(formRapor.semester),
      });
      setNilaiRapor((prev) => [created, ...prev]);
      setFormRapor((c) => ({ ...c, mata_pelajaran: "", nilai: "", semester: "1" }));
      setRaporModalOpen(false);
      
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Nilai rapor berhasil ditambahkan.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      const message = err.response?.data?.message || "Gagal menyimpan nilai rapor.";
      setError(message);
      
      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan",
        text: message,
        confirmButtonColor: "#dc2626"
      });
    }
  };

  const handleDeleteRapor = async (id) => {
    if (!confirm("Hapus nilai rapor ini?")) return;
    try {
      await deleteNilaiRapor(id);
      setNilaiRapor((prev) => prev.filter((item) => item.id !== id));
      showSuccess("Nilai rapor berhasil dihapus.");
    } catch {
      setError("Gagal menghapus nilai rapor.");
    }
  };

  const openTambahRapor = (studentId) => {
    setActiveRaporStudentId(studentId);
    setFormRapor((p) => ({ ...p, siswa_id: studentId }));
    setRaporModalOpen(true);
  };

  const hasActiveFilter = filterKelas || filterMataPelajaran || filterSemester || filterTahunAjaran;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .siswa-page * { font-family: 'Plus Jakarta Sans', sans-serif; }
        .table-row-hover:hover { background: #f8faff; }
        @keyframes slideUp { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
        .animate-slideup { animation: slideUp .2s ease; }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        .animate-fadein { animation: fadeIn .15s ease; }
      `}</style>

      <div className="siswa-page space-y-6">
        {/* Toast notifications */}
        {successMessage && (
          <div className="animate-slideup fixed bottom-6 right-6 z-[100] flex items-center gap-2.5 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-xl">
            <Icon.CheckCircle />
            {successMessage}
          </div>
        )}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* Page header */}
          <div
            className="px-8 py-6"
            style={{ background: "linear-gradient(135deg, #f8faff 0%, #eff6ff 100%)", borderBottom: "1px solid #e2e8f0" }}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Data Siswa & Nilai Rapor</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Kelola data siswa, kelas, jurusan, dan nilai rapor.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
              >
                <Icon.User />
                Kelola Akun Siswa
              </button>
            </div>
          </div>

          <div className="px-8 py-6 space-y-5">
            {error && (
              <div className="animate-slideup rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            {/* Filters */}
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                <Icon.Filter />
                Filter Data
                {hasActiveFilter && (
                  <button
                    onClick={() => { setFilterKelas(""); setFilterMataPelajaran(""); setFilterSemester(""); setFilterTahunAjaran(""); }}
                    className="ml-auto rounded-lg bg-rose-50 px-2 py-1 text-[10px] font-semibold text-rose-500 hover:bg-rose-100 normal-case tracking-normal"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Select label="Kelas" value={filterKelas} onChange={(e) => setFilterKelas(e.target.value)}>
                  <option value="">Semua Kelas</option>
                  {classOptions.map((k) => <option key={k} value={k}>{k}</option>)}
                </Select>
                <Select label="Mata Pelajaran" value={filterMataPelajaran} onChange={(e) => setFilterMataPelajaran(e.target.value)}>
                  <option value="">Semua Mapel</option>
                  {uniqueSubjects.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
                <Select label="Semester" value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)}>
                  <option value="">Semua Semester</option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                </Select>
                <Select label="Tahun Ajaran" value={filterTahunAjaran} onChange={(e) => setFilterTahunAjaran(e.target.value)}>
                  <option value="">Semua Tahun</option>
                  {uniqueTahunAjaran.map((t) => <option key={t} value={t}>{t}</option>)}
                </Select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              {loading ? (
                <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500">
                  <svg className="h-5 w-5 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20" />
                  </svg>
                  Memuat data...
                </div>
              ) : (
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr style={{ background: "linear-gradient(to right, #f8faff, #eff6ff)" }}>
                      {["No", "Nama Siswa", "NISN", "Kelas", "Jurusan", "Rata-rata", "Aksi"].map((h) => (
                        <th key={h} className="border-b border-slate-200 px-4 py-3.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-14 text-center text-sm text-slate-500">
                          Tidak ada data siswa yang sesuai filter.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student, idx) => {
                        const g = student.rata_rata !== "-" ? gradeColor(student.rata_rata) : null;
                        return (
                          <tr key={student.id} className="table-row-hover border-b border-slate-100 last:border-0">
                            <td className="px-4 py-3.5 text-xs font-semibold text-slate-400">{idx + 1}</td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xs font-black text-indigo-600">
                                  {student.nama?.charAt(0)?.toUpperCase()}
                                </div>
                                <span className="font-semibold text-slate-800">{student.nama}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 font-mono text-xs text-slate-600">{student.nisn}</td>
                            <td className="px-4 py-3.5">
                              {student.kelas
                                ? <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{student.kelas}</span>
                                : <span className="text-slate-400">—</span>}
                            </td>
                            <td className="px-4 py-3.5">
                              {student.jurusan
                                ? <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${student.jurusan === "IPA" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>{student.jurusan}</span>
                                : <span className="text-slate-400">—</span>}
                            </td>
                            <td className="px-4 py-3.5">
                              {g ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-800">{student.rata_rata}</span>
                                  <span className="rounded-lg px-1.5 py-0.5 text-[10px] font-black" style={{ background: g.bg, color: g.text }}>
                                    {g.label}
                                  </span>
                                </div>
                              ) : <span className="text-slate-400">—</span>}
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setRaporDetailId(student.id)}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
                                >
                                  <Icon.Book />
                                  Rapor
                                </button>
                                <button
                                  onClick={() => openTambahRapor(student.id)}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700"
                                >
                                  <Icon.Plus />
                                  Tambah
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer count */}
            {!loading && (
              <p className="text-right text-xs text-slate-400">
                Menampilkan <span className="font-bold text-slate-600">{filteredStudents.length}</span> dari{" "}
                <span className="font-bold text-slate-600">{students.length}</span> siswa
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Rapor Detail Popup */}
      {raporDetailId && raporDetailStudent && (
        <RaporDetailModal
          student={raporDetailStudent}
          rapor={raporDetailData}
          onClose={() => setRaporDetailId("")}
          onDelete={handleDeleteRapor}
          onAddClick={() => {
            setRaporDetailId("");
            openTambahRapor(raporDetailStudent.id);
          }}
        />
      )}

      {/* Tambah Rapor Modal */}
      {raporModalOpen && (
        <TambahRaporModal
          student={activeRaporStudent}
          formRapor={formRapor}
          setFormRapor={setFormRapor}
          onSubmit={handleSubmitRapor}
          onClose={() => { setRaporModalOpen(false); setActiveRaporStudentId(""); }}
          error={error}
        />
      )}

      {/* Kelola Siswa Modal */}
      {modalOpen && (
        <KelolaModal
          students={students}
          classOptions={classOptions}
          selectedStudentId={selectedStudentId}
          formData={formData}
          formError={formError}
          saving={saving}
          onSelect={handleStudentSelect}
          onChange={(k, v) => setFormData((p) => ({ ...p, [k]: v }))}
          onSubmit={handleSubmit}
          onClose={() => { setModalOpen(false); setSelectedStudentId(""); setFormData({ password: "", kelas: "", jurusan: "" }); }}
        />
      )}
    </>
  );
}