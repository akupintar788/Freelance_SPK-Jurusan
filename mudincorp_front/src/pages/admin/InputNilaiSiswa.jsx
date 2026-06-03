import { useEffect, useMemo, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { fetchSiswa } from "../../services/siswaService.js";
import { fetchKriteria } from "../../services/kriteriaService.js";
import { fetchNilaiSiswa, saveNilaiSiswa } from "../../services/nilaiSiswaService.js";

export default function InputNilaiSiswa() {
  const [students, setStudents] = useState([]);
  const [kriterias, setKriterias] = useState([]);
  const [nilaiRows, setNilaiRows] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const academicKriterias = useMemo(() => {
    return kriterias.filter((item) => (item.kategori || "Akademik") === "Akademik" && item.tipe === "benefit");
  }, [kriterias]);

  const selectedStudent = students.find((student) => String(student.id) === String(selectedStudentId));

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [studentData, kriteriaData, nilaiData] = await Promise.all([
        fetchSiswa(),
        fetchKriteria(),
        fetchNilaiSiswa(),
      ]);

      setStudents(studentData);
      setKriterias(kriteriaData);
      setNilaiRows(nilaiData);
    } catch (err) {
      setError("Gagal memuat data siswa, kriteria, atau nilai.");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentChange = (studentId) => {
    setSelectedStudentId(studentId);
    setSuccessMessage("");
    setError("");

    const currentScores = nilaiRows
      .filter((row) => String(row.siswa_id) === String(studentId))
      .reduce((map, row) => {
        map[row.kriteria_id] = row.nilai;
        return map;
      }, {});

    setScores(currentScores);
  };

  const handleScoreChange = (kriteriaId, value) => {
    setScores((current) => ({ ...current, [kriteriaId]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedStudentId) {
      setError("Pilih siswa terlebih dahulu.");
      return;
    }

    const emptyCount = academicKriterias.filter((item) => scores[item.id] === undefined || scores[item.id] === "").length;
    if (emptyCount > 0) {
      setError(`Masih ada ${emptyCount} nilai akademik yang belum diisi.`);
      return;
    }

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      await Promise.all(
        academicKriterias.map((kriteria) =>
          saveNilaiSiswa({
            siswa_id: Number(selectedStudentId),
            kriteria_id: kriteria.id,
            nilai: Number(scores[kriteria.id]),
          }),
        ),
      );

      setSuccessMessage("Nilai akademik siswa berhasil disimpan.");
      await loadData();
    } catch (err) {
      setError("Gagal menyimpan nilai siswa. Pastikan nilai berada pada rentang 0-100.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="gurubk-page min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Input Nilai Akademik Siswa</h1>
          <p className="mt-2 text-sm text-slate-500">
            Nilai ini mengisi kriteria SAW kategori Akademik, seperti Matematika, Bahasa Inggris, IPA, atau Seni.
          </p>
        </header>

        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-3xl border border-slate-200 bg-white">
            <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
          </div>
        ) : (
          <form className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
            {successMessage && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-slate-700">
                <span>Pilih Siswa</span>
                <select
                  value={selectedStudentId}
                  onChange={(event) => handleStudentChange(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-400"
                  required
                >
                  <option value="">Pilih siswa</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.nama} - {student.user?.nip || "-"}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm text-slate-700">
                <span>NISN</span>
                <input
                  type="text"
                  value={selectedStudent?.user?.nip || ""}
                  readOnly
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3"
                />
              </label>
            </div>

            {academicKriterias.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                Belum ada kriteria kategori Akademik. Tambahkan dulu di menu Data Kriteria.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {academicKriterias.map((kriteria) => (
                  <label key={kriteria.id} className="block text-sm text-slate-700">
                    <span>{kriteria.nama_kriteria}</span>
                    <input
                      type="number"
                      value={scores[kriteria.id] ?? ""}
                      onChange={(event) => handleScoreChange(kriteria.id, event.target.value)}
                      placeholder="0 - 100"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-400"
                      min="0"
                      max="100"
                      required
                    />
                  </label>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={saving || academicKriterias.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Menyimpan..." : "Simpan Nilai Akademik"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
