// src/pages/admin/jurusan/JurusanPage.jsx

import { useEffect, useState } from "react";
import {
  createJurusan,
  deleteJurusan,
  fetchJurusan,
  updateJurusan,
} from "../../services/jurusanService.js";

import { fetchFakultas } from "../../services/fakultasService.js";

export default function JurusanPage() {
  const [jurusan, setJurusan] = useState([]);
  const [fakultas, setFakultas] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    fakultas_id: "",
    kode_jurusan: "",
    nama_jurusan: "",
    deskripsi: "",
    is_active: 1,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [jurusanData, fakultasData] =
        await Promise.all([
          fetchJurusan(),
          fetchFakultas(),
        ]);

      setJurusan(jurusanData || []);
      setFakultas(fakultasData || []);
    } catch (err) {
      console.log(err);

      setError("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetForm = () => {
    setEditingId(null);

    setFormData({
      fakultas_id: "",
      kode_jurusan: "",
      nama_jurusan: "",
      deskripsi: "",
      is_active: 1,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const payload = {
        ...formData,
        fakultas_id: Number(
          formData.fakultas_id
        ),
        is_active: Number(
          formData.is_active
        ),
      };

      if (editingId) {
        await updateJurusan(
          editingId,
          payload
        );

        setSuccessMessage(
          "Jurusan berhasil diperbarui"
        );
      } else {
        await createJurusan(payload);

        setSuccessMessage(
          "Jurusan berhasil ditambahkan"
        );
      }

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      setModalOpen(false);

      resetForm();

      loadData();
    } catch (err) {
      console.log(err);

      const errors = err.response?.data;

      setError(
        typeof errors === "object"
          ? Object.values(errors)
              .flat()
              .join(" ")
          : "Gagal menyimpan data"
      );
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);

    setFormData({
      fakultas_id:
        item.fakultas_id || "",
      kode_jurusan:
        item.kode_jurusan || "",
      nama_jurusan:
        item.nama_jurusan || "",
      deskripsi:
        item.deskripsi || "",
      is_active:
        item.is_active ?? 1,
    });

    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (
      !confirm(
        "Yakin ingin menghapus jurusan ini?"
      )
    )
      return;

    try {
      await deleteJurusan(id);

      setJurusan((prev) =>
        prev.filter(
          (item) => item.id !== id
        )
      );

      setSuccessMessage(
        "Jurusan berhasil dihapus"
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.log(err);

      setError(
        "Gagal menghapus jurusan"
      );
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Data Jurusan
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Kelola data jurusan
              berdasarkan fakultas.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
            className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            Tambah Jurusan
          </button>
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

        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-6 text-sm text-slate-500">
              Memuat data...
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
                    Nama Jurusan
                  </th>

                  <th className="border-b border-slate-200 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    Fakultas
                  </th>

                  <th className="border-b border-slate-200 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    Status
                  </th>

                  <th className="border-b border-slate-200 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {jurusan.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-sm text-slate-500"
                    >
                      Tidak ada data jurusan
                    </td>
                  </tr>
                ) : (
                  jurusan.map(
                    (item, index) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="border-b border-slate-200 px-4 py-4">
                          {index + 1}
                        </td>

                        <td className="border-b border-slate-200 px-4 py-4 font-semibold">
                          {
                            item.kode_jurusan
                          }
                        </td>

                        <td className="border-b border-slate-200 px-4 py-4">
                          {
                            item.nama_jurusan
                          }
                        </td>

                        <td className="border-b border-slate-200 px-4 py-4">
                          {item
                            .fakultas
                            ?.nama_fakultas ||
                            "-"}
                        </td>

                        <td className="border-b border-slate-200 px-4 py-4">
                          {Number(
                            item.is_active
                          ) === 1 ? (
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                              Aktif
                            </span>
                          ) : (
                            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                              Nonaktif
                            </span>
                          )}
                        </td>

                        <td className="border-b border-slate-200 px-4 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleEdit(
                                  item
                                )
                              }
                              className="rounded-2xl bg-amber-100 px-4 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-200"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(
                                  item.id
                                )
                              }
                              className="rounded-2xl bg-rose-100 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-200"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl ring-1 ring-slate-200">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {editingId
                    ? "Edit Jurusan"
                    : "Tambah Jurusan"}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Lengkapi form data
                  jurusan.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setModalOpen(false)
                }
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Tutup
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <label className="block text-sm text-slate-700">
                <span className="mb-2 block">
                  Fakultas
                </span>

                <select
                  value={
                    formData.fakultas_id
                  }
                  onChange={(e) =>
                    handleChange(
                      "fakultas_id",
                      e.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-400"
                  required
                >
                  <option value="">
                    Pilih Fakultas
                  </option>

                  {fakultas.map(
                    (item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {
                          item.nama_fakultas
                        }
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="block text-sm text-slate-700">
                <span className="mb-2 block">
                  Kode Jurusan
                </span>

                <input
                  type="text"
                  value={
                    formData.kode_jurusan
                  }
                  onChange={(e) =>
                    handleChange(
                      "kode_jurusan",
                      e.target.value
                    )
                  }
                  placeholder="Contoh: TI"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-400"
                  required
                />
              </label>

              <label className="block text-sm text-slate-700">
                <span className="mb-2 block">
                  Nama Jurusan
                </span>

                <input
                  type="text"
                  value={
                    formData.nama_jurusan
                  }
                  onChange={(e) =>
                    handleChange(
                      "nama_jurusan",
                      e.target.value
                    )
                  }
                  placeholder="Contoh: Teknik Informatika"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-400"
                  required
                />
              </label>

              <label className="block text-sm text-slate-700">
                <span className="mb-2 block">
                  Deskripsi
                </span>

                <textarea
                  value={
                    formData.deskripsi
                  }
                  onChange={(e) =>
                    handleChange(
                      "deskripsi",
                      e.target.value
                    )
                  }
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-400"
                />
              </label>

              <label className="block text-sm text-slate-700">
                <span className="mb-2 block">
                  Status
                </span>

                <select
                  value={
                    formData.is_active
                  }
                  onChange={(e) =>
                    handleChange(
                      "is_active",
                      e.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-400"
                >
                  <option value={1}>
                    Aktif
                  </option>

                  <option value={0}>
                    Nonaktif
                  </option>
                </select>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                >
                  {editingId
                    ? "Update Jurusan"
                    : "Simpan Jurusan"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setModalOpen(false)
                  }
                  className="flex-1 rounded-2xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-300"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}