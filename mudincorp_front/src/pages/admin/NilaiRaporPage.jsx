import React, { useEffect, useMemo, useRef, useState } from "react";
import { Download, Upload, FileSpreadsheet, FileText, Loader2, Plus, Eye, Trash2 } from "lucide-react";
import axios from "axios"; // Gunakan instance client bawaan Anda jika ada rute dasar auth
import client from "../../services/authService.js"; // Ganti dengan path instance axios Anda jika ada
import {
  createNilaiRapor,
  deleteNilaiRapor,
  fetchNilaiRapor,
} from "../../services/nilaiRaporService.js";

import { fetchSiswa } from "../../services/siswaService.js";

export default function NilaiRaporPage() {
  const [users, setUsers] = useState([]);
  const [nilaiRapor, setNilaiRapor] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [expandedStudent, setExpandedStudent] = useState(null);
  
  // State pelacak proses upload khusus per siswa
  const [uploadingSiswaId, setUploadingSiswaId] = useState(null);
  const fileInputRef = useRef(null);
  
  const [filterMataPelajaran, setFilterMataPelajaran] = useState("");
  const [filterTahunAjaran, setFilterTahunAjaran] = useState("");
  const [form, setForm] = useState({
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
    try {
      setLoading(true);
      const [siswaData, nilaiData] = await Promise.all([
        fetchSiswa(),
        fetchNilaiRapor(),
      ]);
      setUsers(siswaData);
      setNilaiRapor(nilaiData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }

  // === FITUR INDIVIDU AKSES EXCEL & PDF ===

  const handleExportExcelSiswa = async (siswaId, namaSiswa) => {
    try {
      const response = await client.get(`/admin/nilai-rapor/siswa/${siswaId}/export-excel`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Format_Nilai_${namaSiswa.replace(/\s+/g, "_")}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Gagal export excel:", err);
      setError("Gagal mengekspor data Excel siswa.");
    }
  };

  const handleExportPdfSiswa = async (siswaId, namaSiswa) => {
    try {
      const response = await client.get(`/admin/nilai-rapor/siswa/${siswaId}/export-pdf`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Rapor_${namaSiswa.replace(/\s+/g, "_")}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Gagal cetak PDF:", err);
      setError("Gagal mencetak dokumen PDF siswa.");
    }
  };

  const handleImportExcelSiswa = async (event) => {
    const file = event.target.files[0];
    if (!file || !uploadingSiswaId) return;

    try {
      setError("");
      const formData = new FormData();
      formData.append("file", file);

      await client.post(`/admin/nilai-rapor/siswa/${uploadingSiswaId}/import-excel`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessMessage("Nilai siswa berhasil diperbarui dari Excel.");
      setTimeout(() => setSuccessMessage(""), 3000);
      loadData();
    } catch (err) {
      console.error("Error importing excel:", err);
      setError(err.response?.data?.message || "Gagal memproses file Excel.");
    } finally {
      setUploadingSiswaId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = (siswaId) => {
    setUploadingSiswaId(siswaId);
    fileInputRef.current?.click();
  };

  // === HANDLER CRUDS BAWAAN ANDA ===

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError("");
      await createNilaiRapor({
        ...form,
        siswa_id: Number(form.siswa_id),
        semester: Number(form.semester),
      });
      setSuccessMessage("Nilai rapor berhasil ditambahkan.");
      setTimeout(() => setSuccessMessage(""), 3000);
      setShowForm(false);
      setForm({
        siswa_id: "",
        mata_pelajaran: "",
        nilai: "",
        semester: "1",
        tahun_ajaran: "2024/2025",
      });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menambahkan nilai.");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Hapus nilai ini?")) return;
    try {
      await deleteNilaiRapor(id);
      setSuccessMessage("Nilai rapor berhasil dihapus.");
      setTimeout(() => setSuccessMessage(""), 3000);
      loadData();
    } catch (err) {
      setError("Gagal menghapus nilai.");
    }
  }

  async function handleDeleteAll(items) {
    if (!confirm(`Hapus ${items.length} nilai untuk siswa ini?`)) return;
    try {
      await Promise.all(items.map((item) => deleteNilaiRapor(item.id)));
      setSuccessMessage(`${items.length} nilai berhasil dihapus.`);
      setTimeout(() => setSuccessMessage(""), 3000);
      loadData();
    } catch (err) {
      setError("Gagal menghapus nilai.");
    }
  }

  const uniqueSubjects = useMemo(() => {
    return [...new Set(nilaiRapor.map((item) => item.mata_pelajaran).filter(Boolean))];
  }, [nilaiRapor]);

  const uniqueYears = useMemo(() => {
    return [...new Set(nilaiRapor.map((item) => item.tahun_ajaran).filter(Boolean))];
  }, [nilaiRapor]);

  const filteredData = useMemo(() => {
    let filtered = [...nilaiRapor];
    if (filterMataPelajaran) {
      filtered = filtered.filter((item) => item.mata_pelajaran === filterMataPelajaran);
    }
    if (filterTahunAjaran) {
      filtered = filtered.filter((item) => item.tahun_ajaran === filterTahunAjaran);
    }

    const grouped = {};
    filtered.forEach((item) => {
      const siswa = item.siswa;
      if (!siswa) return;
      if (!grouped[siswa.id]) {
        grouped[siswa.id] = { siswa, items: [], nilai: [] };
      }
      grouped[siswa.id].items.push(item);
      grouped[siswa.id].nilai.push(Number(item.nilai));
    });

    return Object.values(grouped).map((group) => ({
      ...group,
      rata_rata: (group.nilai.reduce((a, b) => a + b, 0) / group.nilai.length).toFixed(2),
    }));
  }, [nilaiRapor, filterMataPelajaran, filterTahunAjaran]);

  return (
    <div className="space-y-6">
      {/* INPUT FILE STANDALONE YANG DI-TRIGGER DARI TOMBOL PER-SISWA */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleImportExcelSiswa}
      />

      {/* HEADER */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Nilai Rapor</h1>
          <p className="mt-1 text-sm text-slate-500">Kelola data nilai siswa secara massal atau per individu</p>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        )}

        {/* FILTER BAR */}
        <div className="grid gap-4 lg:grid-cols-2">
          <select
            value={filterMataPelajaran}
            onChange={(e) => setFilterMataPelajaran(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400"
          >
            <option value="">Semua Mata Pelajaran</option>
            {uniqueSubjects.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <select
            value={filterTahunAjaran}
            onChange={(e) => setFilterTahunAjaran(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400"
          >
            <option value="">Semua Tahun Ajaran</option>
            {uniqueYears.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
      </section>

      {/* TABLE */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-4 text-left font-semibold text-slate-500">No</th>
                <th className="px-4 py-4 text-left font-semibold text-slate-500">Nama</th>
                <th className="px-4 py-4 text-left font-semibold text-slate-500">Tahun Ajaran</th>
                <th className="px-4 py-4 text-left font-semibold text-slate-500">Rata-Rata</th>
                <th className="px-4 py-4 text-center font-semibold text-slate-500">Kelola Dokumen</th>
                <th className="px-4 py-4 text-left font-semibold text-slate-500">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">Memuat data...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">Tidak ada data</td>
                </tr>
              ) : (
                filteredData.map((data, index) => (
                  <React.Fragment key={data.siswa.id}>
                    <tr className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-4">{index + 1}</td>
                      <td className="px-4 py-4 font-semibold text-slate-900">{data.siswa.nama}</td>
                      <td className="px-4 py-4">{data.items[0]?.tahun_ajaran}</td>
                      <td className="px-4 py-4 font-bold text-sky-700">{data.rata_rata}</td>
                      
                      {/* FITUR EXCEL & PDF INDIVIDU DI KOLOM BARU (AKSI) */}
                      <td className="px-4 py-4">
                        <div className="flex justify-center gap-1.5">
                          <button
                            title="Export Format Excel Siswa"
                            onClick={() => handleExportExcelSiswa(data.siswa.id, data.siswa.nama)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                          >
                            <FileSpreadsheet className="h-4 w-4" />
                          </button>
                          
                          <button
                            title="Import Nilai Excel Siswa"
                            onClick={() => triggerFileInput(data.siswa.id)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition"
                          >
                            <Upload className="h-4 w-4" />
                          </button>

                          <button
                            title="Cetak PDF Nilai Rapor"
                            onClick={() => handleExportPdfSiswa(data.siswa.id, data.siswa.nama)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              setSelectedSiswa(data.siswa);
                              setForm({ ...form, siswa_id: data.siswa.id });
                              setShowForm(true);
                            }}
                            className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" /> Nilai
                          </button>

                          <button
                            onClick={() => setExpandedStudent(expandedStudent === data.siswa.id ? null : data.siswa.id)}
                            className="rounded-xl bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-200 flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" /> Detail
                          </button>

                          <button
                            onClick={() => handleDeleteAll(data.items)}
                            className="rounded-xl bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-200 flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" /> Bersihkan
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* EXPANDED ROW DETAIL */}
                    {expandedStudent === data.siswa.id && (
                      <tr>
                        <td colSpan={6} className="bg-slate-50 px-6 py-5">
                          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-inner">
                            <table className="min-w-full text-sm">
                              <thead className="bg-slate-100">
                                <tr>
                                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Mata Pelajaran</th>
                                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Nilai</th>
                                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Semester</th>
                                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Tahun Ajaran</th>
                                  <th className="px-4 py-3 text-center font-semibold text-slate-600">Opsi</th>
                                </tr>
                              </thead>
                              <tbody>
                                {data.items.map((item) => (
                                  <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                                    <td className="px-4 py-3">{item.mata_pelajaran}</td>
                                    <td className="px-4 py-3 font-semibold text-slate-800">{item.nilai}</td>
                                    <td className="px-4 py-3">{item.semester}</td>
                                    <td className="px-4 py-3">{item.tahun_ajaran}</td>
                                    <td className="px-4 py-3 text-center">
                                      <button
                                        onClick={() => handleDelete(item.id)}
                                        className="text-rose-600 hover:text-rose-800 font-medium px-2 py-1 text-xs hover:bg-rose-50 rounded"
                                      >
                                        Hapus
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL FORM TAMBAH NILAI (Bawaan Anda tetap aman) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Tambah Nilai</h2>
                <p className="mt-1 text-sm text-slate-500">{selectedSiswa?.nama}</p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <input
                type="text"
                value={selectedSiswa?.nama || ""}
                disabled
                className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-900"
              />
              <input
                type="text"
                placeholder="Mata Pelajaran"
                value={form.mata_pelajaran}
                onChange={(e) => setForm({ ...form, mata_pelajaran: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"
                required
              />
              <input
                type="number"
                placeholder="Nilai"
                value={form.nilai}
                onChange={(e) => setForm({ ...form, nilai: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"
                required
              />
              <select
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400"
              >
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
              <input
                type="text"
                placeholder="2024/2025"
                value={form.tahun_ajaran}
                onChange={(e) => setForm({ ...form, tahun_ajaran: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400 md:col-span-2"
                required
              />
              <div className="flex gap-3 md:col-span-2">
                <button type="submit" className="flex-1 rounded-2xl bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700">
                  Simpan
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-2xl bg-slate-200 px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-300">
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