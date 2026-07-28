import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {createKriteria,deleteKriteria,fetchKriteria,updateKriteria,} from "../../services/kriteriaService.js";
import Badge from "./components/Badge.jsx";
import Swal from "sweetalert2";
// Sesuaikan dengan enum database kamu
const SUMBER_DATA_OPTIONS = [
  { value: "akademik", label: "Akademik" },
  { value: "survei", label: "Survei" },
];

const TIPE_OPTIONS = [
  { value: "benefit", label: "Benefit" },
  { value: "cost", label: "Cost" },
];

const SUMBER_DATA_COLORS = {
  akademik: "blue",
  survei: "purple",
};

export default function KriteriaPage() {
  const [kriterias, setKriterias] = useState([]);
  const totalBobot = kriterias.reduce((sum, item) => sum + Number(item.bobot || 0),0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Menggunakan kolom asli database
  const initialForm = {
    kode: "",
    nama: "",
    sumber_data: "akademik",
    tipe: "benefit",
    bobot: 0,
  };

  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadKriteria();
  }, []);

  const loadKriteria = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchKriteria();
      setKriterias(data);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data kriteria dari server.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const bobotBaru = parseFloat(formData.bobot) || 0;
  const bobotLama = editingId
    ? parseFloat(kriterias.find((k) => k.id === editingId)?.bobot || 0)
    : 0;
  const totalSetelahSubmit = totalBobot - bobotLama + bobotBaru;

  if (Math.abs(totalSetelahSubmit - 1) > 0.001 && totalSetelahSubmit > 1) {
    Swal.fire({
      icon: "warning",
      title: "Bobot Melebihi 1",
      text: `Total bobot akan menjadi ${totalSetelahSubmit.toFixed(2)}. Maksimal 1.00.`,
    });
    return;
  }

  setSubmitting(true);
    setError("");
    setSuccessMsg("");

    try {
      const payload = {
        kode: formData.kode,
        nama: formData.nama,
        sumber_data: formData.sumber_data,
        tipe: formData.tipe,
        bobot: parseFloat(formData.bobot),
      };

if (editingId) {
  await updateKriteria(editingId, payload);

  Swal.fire({
    icon: "success",
    title: "Berhasil",
    text: "Kriteria berhasil diperbarui",
    confirmButtonColor: "#0284c7",
  });

} else {

  await createKriteria(payload);

  Swal.fire({
    icon: "success",
    title: "Berhasil",
    text: "Kriteria berhasil ditambahkan",
    confirmButtonColor: "#0284c7",
  });
}

      setFormData(initialForm);
      setEditingId(null);
      await loadKriteria();

      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {

  console.error(err);

  let message = "Terjadi kesalahan";

  if (err.response?.data?.message) {

    message = err.response.data.message;

  } else if (err.response?.data) {

    const errors = err.response.data;

    const firstError = Object.values(errors)[0];

    message = Array.isArray(firstError)
      ? firstError[0]
      : "Terjadi kesalahan validasi.";
  }

  Swal.fire({
    icon: "error",
    title: "Gagal",
    text: message,
    confirmButtonColor: "#dc2626",
  });
} finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      kode: item.kode,
      nama: item.nama,
      sumber_data: item.sumber_data,
      tipe: item.tipe,
      bobot: item.bobot,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus kriteria ini?"))
      return;

    try {
      await deleteKriteria(id);
      setSuccessMsg("Kriteria berhasil dihapus.");
      await loadKriteria();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Gagal menghapus kriteria.");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialForm);
  };

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
      {/* Alert Error */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Alert Success */}
      {successMsg && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMsg}
        </div>
      )}

      {/* FORM SINKRON DATABASE */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3 text-slate-900">
          <span className="inline-flex h-3 w-3 rounded-full bg-sky-500"></span>
          <h2 className="text-sm font-semibold text-black">
            {editingId ? "Edit Kriteria" : "Tambah Kriteria"}
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 xl:grid-cols-5">
            {/* Kode Kriteria */}
            <label className="block text-sm text-slate-600">
              <span className="mb-2 block">Kode Kriteria</span>
              <input
                type="text"
                name="kode"
                value={formData.kode}
                onChange={handleChange}
                placeholder="Contoh: C1"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-400"
                required
              />
            </label>

            {/* Nama Kriteria */}
            <label className="block text-sm text-slate-600">
              <span className="mb-2 block">Nama Kriteria</span>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                placeholder="Contoh: Nilai Rapor Matematika"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-400"
                required
              />
            </label>

            {/* Sumber Data */}
            <label className="block text-sm text-slate-600">
              <span className="mb-2 block">Sumber Data</span>
              <select
                name="sumber_data"
                value={formData.sumber_data}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-400"
                required
              >
                {SUMBER_DATA_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            {/* Tipe / Jenis */}
            <label className="block text-sm text-slate-600">
              <span className="mb-2 block">Tipe</span>
              <select
                name="tipe"
                value={formData.tipe}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-400"
                required
              >
                {TIPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            {/* Bobot */}
            <label className="block text-sm text-slate-600">
              <span className="mb-2 block">Bobot</span>
              <input
                type="number"
                name="bobot"
                step="0.01"
                min="0"
                max="1"
                value={formData.bobot}
                onChange={handleChange}
                placeholder="0.3"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-400"
                required
              />
            </label>
          </div>

          <div className="mt-6 flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
            >
              {submitting ? "Menyimpan..." : "Simpan Kriteria"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-2xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-300"
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </section>

      {/* TABEL SINKRON DATABASE */}
<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
  <div className="mb-5 flex items-center gap-3 text-slate-900">
    <span className="inline-flex h-3 w-3 rounded-full bg-sky-500"></span>
    <h2 className="text-sm font-semibold text-black">Daftar Kriteria</h2>
  </div>
  {/* STATUS TOTAL BOBOT — sudah ada, tinggal perbaiki kondisi warning */}
<div className={`mb-4 rounded-2xl p-4 font-semibold ${
  Math.abs(totalBobot - 1) < 0.001
    ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
    : totalBobot > 1
    ? "bg-rose-50 border border-rose-200 text-rose-700"
    : "bg-amber-50 border border-amber-200 text-amber-700"  // ← kurang dari 1
}`}>
  Total Bobot: {totalBobot.toFixed(2)} / 1.00
  <div className="mt-1 text-sm">
    {Math.abs(totalBobot - 1) < 0.001
      ? "✅ Bobot kriteria sudah valid dan siap digunakan."
      : totalBobot > 1
      ? `❌ Total bobot melebihi 1.00 (saat ini ${totalBobot.toFixed(2)})`
      : `⚠️ Total bobot belum mencapai 1.00 (sisa ${(1 - totalBobot).toFixed(2)})`}
  </div>
</div>

  <div className="overflow-x-auto">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            </div>
          ) : (
            <table className="min-w-full text-left text-sm text-slate-700">
              <thead>
                <tr>
                  <th className="border-b border-slate-200 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    No
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    Kode
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    Nama Kriteria
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    Sumber Data
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    Tipe
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    Bobot
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {kriterias.length > 0 ? (
                  kriterias.map((row, idx) => (
                    <tr key={row.id} className="table-row-hover">
                      <td className="border-b border-slate-200 px-4 py-3">
                        {idx + 1}
                      </td>
                      <td className="border-b border-slate-200 px-4 py-3 font-mono font-bold text-sky-600">
                        {row.kode}
                      </td>
                      <td className="border-b border-slate-200 px-4 py-3 font-semibold">
                        {row.nama}
                      </td>
                      <td className="border-b border-slate-200 px-4 py-3">
                        <Badge
                          color={SUMBER_DATA_COLORS[row.sumber_data] || "blue"}
                        >
                          {row.sumber_data}
                        </Badge>
                      </td>
                      <td className="border-b border-slate-200 px-4 py-3">
                        <Badge
                          color={row.tipe === "benefit" ? "green" : "amber"}
                        >
                          {row.tipe}
                        </Badge>
                      </td>
                      <td className="border-b border-slate-200 px-4 py-3 font-mono">
                        {parseFloat(row.bobot).toFixed(2)}
                      </td>
                      <td className="border-b border-slate-200 px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleEdit(row)}
                            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(row.id)}
                            className="rounded-2xl bg-rose-100 px-3 py-2 text-[11px] font-semibold text-rose-700 transition hover:bg-rose-200"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                  ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="border-b border-slate-200 px-4 py-6 text-center text-slate-500"
                    >
                      Belum ada data kriteria di database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
    </>
  );
}
