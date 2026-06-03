import { useEffect, useMemo, useState } from "react";
import {
  createNilaiRapor,
  deleteNilaiRapor,
  fetchNilaiRapor,
} from "../../services/nilaiRaporService.js";
import { fetchSiswa } from "../../services/siswaService.js";
import { updateUser } from "../../services/userService.js";

export default function SiswaPage() {
  const [students, setStudents] = useState([]);
  const [nilaiRapor, setNilaiRapor] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [formData, setFormData] = useState({
    password: "",
    kelas: "",
    jurusan: "",
  });
  const [formError, setFormError] = useState("");
  const [expandedStudentId, setExpandedStudentId] = useState("");
  const [raporModalOpen, setRaporModalOpen] = useState(false);
  const [activeRaporStudentId, setActiveRaporStudentId] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const [filterMataPelajaran, setFilterMataPelajaran] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [filterTahunAjaran, setFilterTahunAjaran] = useState("");
  const [formRapor, setFormRapor] = useState({
    siswa_id: "",
    mata_pelajaran: "",
    nilai: "",
    semester: "1",
    tahun_ajaran: "2024/2025",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [userData, nilaiData] = await Promise.all([
        fetchSiswa(),
        fetchNilaiRapor(),
      ]);

      setStudents(userData);
      console.log(userData);
      setNilaiRapor(nilaiData);
      if (userData.length > 0) {
        setFormRapor((current) => ({ ...current, siswa_id: userData[0].id }));
      }
    } catch (err) {
      setError("Gagal memuat data siswa atau nilai rapor. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  }

  const studentsWithAverage = useMemo(() => {
    return students.map((student) => {
      const studentScores = nilaiRapor
        .filter((item) => Number(item.siswa_id) === Number(student.id))
        .map((item) => Number(item.nilai) || 0);

      const rataRata = studentScores.length
        ? (
            studentScores.reduce((sum, value) => sum + value, 0) /
            studentScores.length
          ).toFixed(2)
        : "-";

      return {
        ...student,
        rata_rata: rataRata,
      };
    });
  }, [students, nilaiRapor]);

  const selectedStudent = useMemo(
    () =>
      students.find(
        (student) => Number(student.id) === Number(expandedStudentId),
      ),
    [students, expandedStudentId],
  );

  const activeRaporStudent = useMemo(
    () =>
      students.find(
        (student) => Number(student.id) === Number(activeRaporStudentId),
      ),
    [students, activeRaporStudentId],
  );

  const selectedStudentRapor = useMemo(() => {
    if (!expandedStudentId) return [];
    return nilaiRapor.filter(
      (item) => Number(item.siswa_id) === Number(expandedStudentId),
    );
  }, [nilaiRapor, expandedStudentId]);

  const selectedStudentRaporSummary = useMemo(() => {
    const total = selectedStudentRapor.reduce(
      (sum, item) => sum + (Number(item.nilai) || 0),
      0,
    );
    const average = selectedStudentRapor.length
      ? (total / selectedStudentRapor.length).toFixed(2)
      : "-";
    return { total, average };
  }, [selectedStudentRapor]);

  const classOptions = useMemo(() => {
    const defaults = [
      "10 IPA",
      "10 IPS",
      "11 IPA",
      "11 IPS",
      "12 IPA",
      "12 IPS",
    ];
    return [
      ...new Set([
        ...students.map((student) => student.kelas).filter(Boolean),
        ...defaults,
      ]),
    ];
  }, [students]);

  const uniqueSubjects = useMemo(
    () => [
      ...new Set(nilaiRapor.map((item) => item.mata_pelajaran).filter(Boolean)),
    ],
    [nilaiRapor],
  );

  const uniqueTahunAjaran = useMemo(
    () => [
      ...new Set(nilaiRapor.map((item) => item.tahun_ajaran).filter(Boolean)),
    ],
    [nilaiRapor],
  );

  const uniqueJurusan = useMemo(
    () => [
      ...new Set(students.map((student) => student.jurusan).filter(Boolean)),
    ],
    [students],
  );

  const filteredStudents = useMemo(() => {
    return studentsWithAverage.filter((student) => {
      // filter kelas
      if (filterKelas && student.kelas !== filterKelas) {
        return false;
      }

      const studentRapor = nilaiRapor.filter(
        (item) => Number(item.siswa_id) === Number(student.id),
      );

      // filter mapel
      if (
        filterMataPelajaran &&
        !studentRapor.some(
          (item) => item.mata_pelajaran === filterMataPelajaran,
        )
      ) {
        return false;
      }

      // filter semester
      if (
        filterSemester &&
        !studentRapor.some(
          (item) => String(item.semester) === String(filterSemester),
        )
      ) {
        return false;
      }

      // filter tahun ajaran
      if (
        filterTahunAjaran &&
        !studentRapor.some((item) => item.tahun_ajaran === filterTahunAjaran)
      ) {
        return false;
      }

      return true;
    });
  }, [
    studentsWithAverage,
    nilaiRapor,
    filterKelas,
    filterMataPelajaran,
    filterSemester,
    filterTahunAjaran,
  ]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleStudentSelect = (studentId) => {
    const student = students.find(
      (item) => Number(item.id) === Number(studentId),
    );

    setSelectedStudentId(studentId);

    if (!studentId || !student) {
      setFormData({
        password: "",
        kelas: "",
        jurusan: "",
      });

      return;
    }

    setFormData({
      password: "",
      kelas: student.kelas || "",
      jurusan: student.jurusan || "",
    });

    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedStudentId) {
      setFormError("Pilih siswa terlebih dahulu.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      await updateUser(selectedStudentId, {
        role: "siswa",
        kelas: formData.kelas,
        jurusan: formData.jurusan,
        ...(formData.password ? { password: formData.password } : {}),
      });
      setModalOpen(false);
      setSelectedStudentId("");
      setFormData({ password: "", kelas: "", jurusan: "" });
      await loadData();
      setSuccessMessage("Data siswa berhasil diperbarui.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      const message = err?.response?.data?.message ?? err?.message;
      setFormError(
        typeof message === "string"
          ? message
          : "Gagal menyimpan siswa. Periksa kembali inputan.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitRapor = async (event) => {
    event.preventDefault();
    try {
      setError("");
      const created = await createNilaiRapor({
        ...formRapor,
        siswa_id: Number(formRapor.siswa_id),
        semester: Number(formRapor.semester),
      });

      setNilaiRapor((prev) => [created, ...prev]);

      setFormRapor((current) => ({
        ...current,
        mata_pelajaran: "",
        nilai: "",
        semester: "1",
      }));

      setRaporModalOpen(false);
      setActiveRaporStudentId("");
      setSuccessMessage("Nilai rapor berhasil ditambahkan.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.log(err.response?.data);

      const responseErrors = err.response?.data;

      setError(
        responseErrors
          ? typeof responseErrors === "object"
            ? Object.values(responseErrors).flat().join(" ")
            : responseErrors
          : "Gagal menyimpan nilai rapor.",
      );
    }
  };

  const handleDeleteRapor = async (id) => {
    if (!confirm("Hapus nilai rapor ini?")) return;
    try {
      await deleteNilaiRapor(id);
      setNilaiRapor((prev) => prev.filter((item) => item.id !== id));
      setSuccessMessage("Nilai rapor berhasil dihapus.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Gagal menghapus nilai rapor.");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Data Siswa & Nilai Rapor
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Semua data siswa dan ringkasan nilai rapor ada di halaman ini.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              Kelola Akun Siswa
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <label className="block text-sm text-slate-600">
            <span className="mb-2 block">Filter Kelas</span>
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-400"
            >
              <option value="">Semua kelas</option>
              {classOptions.map((kelas) => (
                <option key={kelas} value={kelas}>
                  {kelas}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-slate-600">
            <span className="mb-2 block">Filter Mata Pelajaran</span>
            <select
              value={filterMataPelajaran}
              onChange={(e) => setFilterMataPelajaran(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-400"
            >
              <option value="">Semua mata pelajaran</option>
              {uniqueSubjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-slate-600">
            <span className="mb-2 block">Filter Semester</span>
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-400"
            >
              <option value="">Semua semester</option>
              {[1, 2].map((semester) => (
                <option key={semester} value={semester}>
                  {semester}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-slate-600">
            <span className="mb-2 block">Filter Tahun Ajaran</span>
            <select
              value={filterTahunAjaran}
              onChange={(e) => setFilterTahunAjaran(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-400"
            >
              <option value="">Semua tahun ajaran</option>
              {uniqueTahunAjaran.map((tahun) => (
                <option key={tahun} value={tahun}>
                  {tahun}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-6 text-sm text-slate-500">Memuat data...</div>
          ) : (
            <table className="min-w-full text-left text-sm text-slate-700">
              <thead>
                <tr>
                  <th className="border-b border-slate-200 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    No
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    Nama
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    NISN
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    Kelas
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    Jurusan
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    Rata-rata
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="border-b border-slate-200 px-4 py-6 text-center text-sm text-slate-500"
                    >
                      Tidak ada data siswa yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, index) => (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="border-b border-slate-200 px-4 py-3">
                        {index + 1}
                      </td>
                      <td className="border-b border-slate-200 px-4 py-3">
                        {student.nama}
                      </td>
                      <td className="border-b border-slate-200 px-4 py-3">
                        {student.nisn}
                      </td>
                      <td className="border-b border-slate-200 px-4 py-3">
                        {student.kelas || "-"}
                      </td>
                      <td className="border-b border-slate-200 px-4 py-3">
                        {student.jurusan || "-"}
                      </td>
                      <td className="border-b border-slate-200 px-4 py-3">
                        {student.rata_rata}
                      </td>
                      <td className="border-b border-slate-200 px-4 py-3 space-y-2">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedStudentId((prev) =>
                              prev === student.id ? "" : student.id,
                            )
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          {expandedStudentId === student.id
                            ? "Sembunyikan Rapor"
                            : "Lihat Rapor"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveRaporStudentId(student.id);
                            setFormRapor((prev) => ({
                              ...prev,
                              siswa_id: student.id,
                            }));
                            setRaporModalOpen(true);
                          }}
                          className="w-full rounded-2xl bg-emerald-600 px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-emerald-700"
                        >
                          Tambah Rapor
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {raporModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
            <div className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl ring-1 ring-slate-200">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Tambah Nilai Rapor
                  </h3>
                  <p className="text-sm text-slate-500">
                    Input nilai rapor untuk siswa yang dipilih.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRaporModalOpen(false)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Tutup
                </button>
              </div>

              <form
                className="grid gap-4 lg:grid-cols-2"
                onSubmit={handleSubmitRapor}
              >
                <div className="lg:col-span-2">
                  <label className="block text-sm text-slate-600">
                    <span className="mb-2 block">Siswa</span>
                    <input
                      type="text"
                      value={
                        activeRaporStudent
                          ? `${activeRaporStudent.nama} (${activeRaporStudent.nisn})`
                          : "Tidak ada siswa terpilih"
                      }
                      readOnly
                      className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 outline-none"
                    />
                  </label>
                </div>

<label className="block text-sm text-slate-600">
  <span className="mb-2 block">Mata Pelajaran</span>

  <select
    value={formRapor.mata_pelajaran}
    onChange={(e) =>
      setFormRapor((prev) => ({
        ...prev,
        mata_pelajaran: e.target.value,
      }))
    }
    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-400"
    required
  >
    <option value="" disabled>
      Pilih Mata Pelajaran
    </option>

    <option value="Pendidikan Agama">Pendidikan Agama</option>

    <option value="PPKn">
      PPKn (Pendidikan Pancasila dan Kewarganegaraan)
    </option>

    <option value="Bahasa Indonesia">
      Bahasa Indonesia
    </option>

    <option value="Bahasa Inggris">
      Bahasa Inggris
    </option>

    <option value="Matematika Peminatan">
      Matematika
    </option>

    <option value="Fisika">Fisika</option>

    <option value="Kimia">Kimia</option>

    <option value="Biologi">Biologi</option>

    <option value="Sejarah Indonesia">
      Sejarah Indonesia
    </option>

    <option value="Seni Budaya">
      Seni Budaya
    </option>

    <option value="PJOK">
      Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)
    </option>

    <option value="Prakarya dan Kewirausahaan">
      Prakarya dan Kewirausahaan
    </option>

    <option value="Informatika/TIK">
      Informatika/TIK
    </option>

    {/* IPS */}
    <option value="Ekonomi">Ekonomi</option>

    <option value="Geografi">Geografi</option>

    <option value="Sosiologi">Sosiologi</option>

    <option value="Sejarah Peminatan">
      Sejarah Peminatan
    </option>
  </select>
</label>
                <label className="block text-sm text-slate-600">
                  <span className="mb-2 block">Nilai</span>
                  <input
                    value={formRapor.nilai}
                    onChange={(e) =>
                      setFormRapor((prev) => ({
                        ...prev,
                        nilai: e.target.value,
                      }))
                    }
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="0 - 100"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-400"
                    required
                  />
                </label>
                <label className="block text-sm text-slate-600">
                  <span className="mb-2 block">Semester</span>
                  <select
                    value={formRapor.semester}
                    onChange={(e) =>
                      setFormRapor((prev) => ({
                        ...prev,
                        semester: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-400"
                    required
                  >
                    {[1, 2].map((semester) => (
                      <option key={semester} value={semester}>
                        {semester}
                      </option>
                    ))}
                  </select>
                </label>
<label className="block text-sm text-slate-600 lg:col-span-2">
  <span className="mb-2 block">Tahun Ajaran</span>

  <select
    value={formRapor.tahun_ajaran}
    onChange={(e) =>
      setFormRapor((prev) => ({
        ...prev,
        tahun_ajaran: e.target.value,
      }))
    }
    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-400"
    required
  >
    <option value="" disabled>
      Pilih Tahun Ajaran
    </option>

    <option value="2024/2025">2024/2025</option>
    <option value="2025/2026">2025/2026</option>
    <option value="2026/2027">2026/2027</option>
  </select>
</label>
                <div className="flex gap-2 lg:col-span-2">
                  <button
                    type="submit"
                    className="flex-1 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                  >
                    Simpan Nilai Rapor
                  </button>
                  <button
                    type="button"
                    onClick={() => setRaporModalOpen(false)}
                    className="flex-1 rounded-2xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-300"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {selectedStudent && (
          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Rapor {selectedStudent.nama}
                </h3>
                <p className="text-sm text-slate-500">
                  Detail nilai rapor siswa yang dipilih.
                </p>
              </div>
              <div className="text-sm text-slate-600">
                Total nilai: {selectedStudentRapor.length}
              </div>
            </div>

            {selectedStudentRapor.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                Belum ada nilai rapor untuk siswa ini.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full text-left text-sm text-slate-700">
                  <thead>
                    <tr>
                      <th className="border-b border-slate-200 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                        No
                      </th>
                      <th className="border-b border-slate-200 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                        Mata Pelajaran
                      </th>
                      <th className="border-b border-slate-200 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                        Nilai
                      </th>
                      <th className="border-b border-slate-200 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                        Semester
                      </th>
                      <th className="border-b border-slate-200 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                        Tahun Ajaran
                      </th>
                      <th className="border-b border-slate-200 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudentRapor.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="border-b border-slate-200 px-4 py-3">
                          {index + 1}
                        </td>
                        <td className="border-b border-slate-200 px-4 py-3">
                          {item.mata_pelajaran}
                        </td>
                        <td className="border-b border-slate-200 px-4 py-3">
                          {item.nilai}
                        </td>
                        <td className="border-b border-slate-200 px-4 py-3">
                          {item.semester}
                        </td>
                        <td className="border-b border-slate-200 px-4 py-3">
                          {item.tahun_ajaran}
                        </td>
                        <td className="border-b border-slate-200 px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleDeleteRapor(item.id)}
                            className="rounded-2xl bg-rose-100 px-3 py-2 text-[11px] font-semibold text-rose-700 hover:bg-rose-200"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50/50 font-bold text-slate-900">
                      <td
                        colSpan={2}
                        className="border-b border-slate-200 px-4 py-4 text-right text-[11px] uppercase tracking-wider text-slate-500"
                      >
                        Total Nilai
                      </td>
                      <td className="border-b border-slate-200 px-4 py-4 text-lg">
                        {selectedStudentRaporSummary.total}
                      </td>
                      <td
                        colSpan={3}
                        className="border-b border-slate-200 px-4 py-4"
                      ></td>
                    </tr>
                    <tr className="bg-sky-50 font-bold text-sky-900">
                      <td
                        colSpan={2}
                        className="border-b border-sky-100 px-4 py-4 text-right text-[11px] uppercase tracking-wider text-sky-600"
                      >
                        Nilai Rata-Rata
                      </td>
                      <td className="border-b border-sky-100 px-4 py-4 text-lg text-sky-700">
                        {selectedStudentRaporSummary.average}
                      </td>
                      <td
                        colSpan={3}
                        className="border-b border-sky-100 px-4 py-4"
                      ></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl ring-1 ring-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Kelola Data Siswa
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Pilih siswa dari daftar users untuk mengelola akun siswa.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Tutup
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm text-slate-700">
                  <span className="mb-2 block">Pilih Siswa</span>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => handleStudentSelect(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-400"
                    required
                  >
                    <option value="">-</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.nama} - {student.nisn}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm text-slate-700">
                  <span className="mb-2 block">Kelas</span>
                  <select
                    value={formData.kelas}
                    onChange={(e) => handleChange("kelas", e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-400"
                    required
                  >
                    <option value="">Pilih kelas</option>
                    {classOptions.map((kelas) => (
                      <option key={kelas} value={kelas}>
                        {kelas}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="block text-sm text-slate-700">
                  <span className="mb-2 block">Jurusan</span>
                  <select
                    value={formData.jurusan}
                    onChange={(e) => handleChange("jurusan", e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-400"
                    required
                  >
                    <option value="">Pilih jurusan</option>
                    <option value="IPA">IPA</option>
                    <option value="IPS">IPS</option>
                  </select>
                </label>
              </div>

              {formError && (
                <p className="text-sm text-rose-700">{formError}</p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Menyimpan..." : "Simpan Siswa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
