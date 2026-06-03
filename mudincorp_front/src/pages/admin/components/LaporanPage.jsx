import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import Badge from "./Badge.jsx";
import { LaporanService } from "../../../services/laporanService";

export default function LaporanPage() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total_siswa: 0,
    sudah_diproses: 0,
    belum_diproses: 0,
  });

  const [kelasOptions, setKelasOptions] = useState([]);

  const [reportData, setReportData] = useState([]);

  const [filters, setFilters] = useState({
    kelas: "Semua",
    status: "Semua",
  });

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [filters]);

  const loadFilterOptions = async () => {
    try {
      const data = await LaporanService.getFilterOptions();
      setKelasOptions(data.kelas || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchReportData = async () => {
    setLoading(true);

    try {
      const response = await LaporanService.getLaporan(filters);

      setStats(response.stats);
      setReportData(response.data);
    } catch (error) {
      console.error("Gagal memuat laporan", error);
    } finally {
      setLoading(false);
    }
  };
const handleExportPdf = async () => {
  try {

    const blob =
      await LaporanService.exportPdf();

    const url =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "laporan_hasil_rekomendasi.pdf";

    document.body.appendChild(link);

    link.click();

    link.remove();

  } catch (err) {
    console.error(err);
  }
};
const statusBadge = (row) =>
  row.rekomendasi ? "success" : "warning";

const statusText = (row) =>
  row.rekomendasi ? "Selesai" : "Belum";
return (
  <section className="space-y-6">

    {/* Header */}
    <div>
      <h1 className="text-3xl font-bold text-slate-800">
        Laporan Hasil Rekomendasi Jurusan
      </h1>

      <p className="mt-2 text-sm text-slate-500">
        Ringkasan hasil perhitungan metode SAW untuk seluruh siswa.
      </p>
    </div>

    {/* Statistik */}
    <div className="grid gap-6 lg:grid-cols-3">

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          Total Siswa
        </p>

        <h3 className="mt-3 text-5xl font-bold text-slate-800">
          {stats.total_siswa}
        </h3>
      </div>

      <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          Sudah Diproses SAW
        </p>

        <h3 className="mt-3 text-5xl font-bold text-emerald-600">
          {stats.sudah_diproses}
        </h3>
      </div>

      <div className="rounded-3xl border border-orange-100 bg-orange-50/50 p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          Belum Diproses SAW
        </p>

        <h3 className="mt-3 text-5xl font-bold text-orange-500">
          {stats.belum_diproses}
        </h3>
      </div>

    </div>

    {/* Filter */}
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="grid gap-4 lg:grid-cols-3">

        <select
          className="
            w-full
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            py-3
            text-slate-700
            focus:border-sky-500
            focus:outline-none
            focus:ring-2
            focus:ring-sky-100
          "
          value={filters.kelas}
          onChange={(e) =>
            setFilters({
              ...filters,
              kelas: e.target.value,
            })
          }
        >
          <option value="Semua">
            Semua Kelas
          </option>

          {kelasOptions.map((kelas) => (
            <option
              key={kelas}
              value={kelas}
            >
              {kelas}
            </option>
          ))}
        </select>

        <select
          className="
            w-full
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            py-3
            text-slate-700
            focus:border-sky-500
            focus:outline-none
            focus:ring-2
            focus:ring-sky-100
          "
          value={filters.status}
          onChange={(e) =>
            setFilters({
              ...filters,
              status: e.target.value,
            })
          }
        >
          <option value="Semua">Semua Status</option>
          <option value="Sudah">Sudah Diproses</option>
          <option value="Belum">Belum Diproses</option>
        </select>

        <button
          onClick={handleExportPdf}
          className="
            rounded-xl
            bg-red-600
            px-6
            py-3
            font-medium
            text-white
            transition
            hover:bg-red-700
          "
        >
          Export PDF
        </button>

      </div>

    </div>

    {/* Tabel */}
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      ) : (
        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-slate-50">

              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  No
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Nama Siswa
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Kelas
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Jurusan Rekomendasi
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Nilai Preferensi
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Ranking
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Status
                </th>
              </tr>

            </thead>

            <tbody>

              {reportData.length > 0 ? (
                reportData.map((row, index) => (
                  <tr
                    key={row.id}
                    className="
                      border-b
                      border-slate-100
                      transition
                      hover:bg-slate-50
                    "
                  >
                    <td className="px-6 py-4">
                      {index + 1}
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-800">
                      {row.nama_siswa}
                    </td>

                    <td className="px-6 py-4">
                      {row.kelas}
                    </td>

                    <td className="px-6 py-4">
                      {row.rekomendasi || "-"}
                    </td>

                    <td className="px-6 py-4">
                      {row.skor
                        ? Number(row.skor).toFixed(4)
                        : "-"}
                    </td>

                    <td className="px-6 py-4">
                      {row.skor ? (
                        <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
                          #{index + 1}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <Badge
                        color={
                          row.rekomendasi
                            ? "success"
                            : "warning"
                        }
                      >
                        {row.rekomendasi
                          ? "Selesai"
                          : "Belum"}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="py-12 text-center text-slate-500"
                  >
                    Belum ada hasil rekomendasi jurusan yang tersedia.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>
      )}

    </div>

  </section>
);
}