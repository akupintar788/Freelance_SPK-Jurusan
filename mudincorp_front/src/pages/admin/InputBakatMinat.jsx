import { AlertCircle, Edit2, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

import {createSoalSurvei,deleteSoalSurvei,fetchSoalSurvei,updateSoalSurvei,} from "../../services/adminSurveiService";

import { fetchJurusan } from "../../services/jurusanService";

export default function InputBakatMinat({ lockedCategory }) {
  const [questions, setQuestions] = useState([]);
  const [jurusanList, setJurusanList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editId, setEditId] = useState(null);

  const initialForm = {
    jurusan_id: "",
    tipe: lockedCategory.toLowerCase(),
    pertanyaan: "",
    skor_min: 1,
    skor_max: 5,
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    loadData();
  }, [lockedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [soalData, jurusanData] = await Promise.all([
        fetchSoalSurvei({
          tipe: lockedCategory.toLowerCase(),
        }),
        fetchJurusan(),
      ]);

      setQuestions(soalData);
      setJurusanList(jurusanData);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditId(item.id);

      setFormData({
        jurusan_id: item.jurusan_id,
        tipe: item.tipe,
        pertanyaan: item.pertanyaan,
        skor_min: item.skor_min,
        skor_max: item.skor_max,
      });
    } else {
      setEditId(null);

      setFormData({
        ...initialForm,
        tipe: lockedCategory.toLowerCase(),
      });
    }

    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        jurusan_id: parseInt(formData.jurusan_id),
        tipe: formData.tipe,
        pertanyaan: formData.pertanyaan,
        skor_min: parseInt(formData.skor_min),
        skor_max: parseInt(formData.skor_max),
      };

      if (editId) {
        await updateSoalSurvei(editId, payload);
      } else {
        await createSoalSurvei(payload);
      }

      setIsModalOpen(false);

      await loadData();
    } catch (err) {
      console.error(err);

      if (err.response?.data) {
        const errors = err.response.data;

        const firstError = Object.values(errors)[0];

        if (Array.isArray(firstError)) {
          alert(firstError[0]);
        } else {
          alert("Gagal menyimpan data.");
        }
      } else {
        alert("Terjadi kesalahan.");
      }
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Yakin ingin menghapus pertanyaan?");

    if (!confirmDelete) return;

    try {
      await deleteSoalSurvei(id);

      await loadData();
    } catch (err) {
      console.error(err);

      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("Gagal menghapus data.");
      }
    }
  };

  if (loading) {
    return <div className="p-6 text-slate-500">Memuat data...</div>;
  }

  if (error) {
    return <div className="p-6 text-rose-500">{error}</div>;
  }

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
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Manajemen Survei {lockedCategory}
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Kelola pertanyaan survei {lockedCategory}.
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl transition"
          >
            <Plus size={18} />
            Tambah Pertanyaan
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left">No</th>

                  <th className="px-6 py-4 text-left">Pertanyaan</th>

                  <th className="px-6 py-4 text-left">Jurusan</th>

                  <th className="px-6 py-4 text-left">Tipe</th>

                  <th className="px-6 py-4 text-left">Skor</th>

                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {questions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center text-slate-500">
                        <AlertCircle
                          size={32}
                          className="mb-2 text-slate-300"
                        />

                        <p>Belum ada data pertanyaan.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  questions.map((item, index) => (
                    <tr key={item.id} className="table-row-hover transition">
                      <td className="px-6 py-4">{index + 1}</td>

                      <td className="px-6 py-4 font-medium text-slate-700">
                        {item.pertanyaan}
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold">
                          {item.jurusan?.nama_jurusan || "-"}
                        </span>
                      </td>

                      <td className="px-6 py-4 capitalize">{item.tipe}</td>

                      <td className="px-6 py-4">
                        {item.skor_min} - {item.skor_max}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="p-2 rounded-lg hover:bg-sky-50 hover:text-sky-600 text-slate-400"
                          >
                            <Edit2 size={16} />
                          </button>

                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 rounded-lg hover:bg-rose-50 hover:text-rose-600 text-slate-400"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="w-full max-w-xl overflow-hidden rounded-[28px] bg-white shadow-2xl border border-slate-200">
              <div
                className="relative overflow-hidden px-6 py-5"
                style={{
                  background:
                    "linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e40af 100%)",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-200">
                      Manajemen
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-white">
                      {editId ? "Edit Pertanyaan" : "Tambah Pertanyaan"}
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white hover:bg-white/30 transition"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* PERTANYAAN */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Pertanyaan
                  </label>

                  <textarea
                    rows={4}
                    required
                    value={formData.pertanyaan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pertanyaan: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* JURUSAN */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Jurusan
                  </label>

                  <select
                    required
                    value={formData.jurusan_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        jurusan_id: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">-- Pilih Jurusan --</option>

                    {jurusanList.map((jurusan) => (
                      <option key={jurusan.id} value={jurusan.id}>
                        {jurusan.nama_jurusan}
                      </option>
                    ))}
                  </select>
                </div>

                {/* TIPE */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Tipe
                  </label>

                  <input
                    type="text"
                    disabled
                    value={formData.tipe}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-500"
                  />
                </div>

                {/* SKOR */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Skor Minimum
                    </label>

                    <input
                      type="number"
                      min={1}
                      value={formData.skor_min}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          skor_min: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Skor Maksimum
                    </label>

                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={formData.skor_max}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          skor_max: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
                    />
                  </div>
                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                  >
                    {editId ? "Simpan" : "Tambah"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
