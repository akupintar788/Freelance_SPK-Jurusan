import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import dashboardService from "../../../services/dashboardService.js"; // Import service baru

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  
  const [statData, setStatData] = useState({
    total_siswa: 0,
    total_jurusan_aktif: 0,
    total_kriteria_aktif: 0,
    sudah_dihitung: 0,
    belum_dihitung: 0,
    sudah_survei_bakat: 0,
    sudah_survei_minat: 0,
    bobot_valid: false,
    total_bobot: 0,
  });

  const [distribusi, setDistribusi] = useState([]);
  const [progressSiswa, setProgressSiswa] = useState([]);

  // Mengambil data user untuk menampilkan salam sesuai role
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const roleDisplay = user.role === "guru_bk" ? "Guru BK" : "Admin";

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Panggil dari dashboardService (Promise.all mempercepat proses loading)
      const [resStat, resDist, resProgress] = await Promise.all([
        dashboardService.getStatistik(),
        dashboardService.getDistribusiJurusan(),
        dashboardService.getProgressSiswa(5), 
      ]);

      setStatData(resStat.data);
      setDistribusi(resDist.data.data || []);
      setProgressSiswa(resProgress.data.data || []);
    } catch (error) {
      console.error("Gagal memuat data dashboard lengkap:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: "Total Siswa", value: statData.total_siswa, desc: "Jumlah siswa terdaftar" },
    { title: "Jurusan Aktif", value: statData.total_jurusan_aktif, desc: "Jurusan/prodi tersedia" },
    { title: "Kriteria Aktif", value: statData.total_kriteria_aktif, desc: "Kriteria kualifikasi SAW" },
    { title: "Sudah Dihitung", value: statData.sudah_dihitung, desc: "Siswa selesai diproses" },
    { title: "Belum Dihitung", value: statData.belum_dihitung, desc: "Siswa antrean proses" },
    { title: "Survei Bakat", value: statData.sudah_survei_bakat, desc: "Siswa selesai mengisi" },
    { title: "Survei Minat", value: statData.sudah_survei_minat, desc: "Siswa selesai mengisi" },
  ];

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER DINAMIS */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard {roleDisplay}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ringkasan statistik Sistem Pendukung Keputusan pemilihan jurusan.
        </p>
      </div>

      {/* STATS CARDS GRID */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{card.title}</p>
            <h2 className="mt-4 text-4xl font-bold text-slate-900">{card.value}</h2>
            <p className="mt-2 text-sm text-slate-400">{card.desc}</p>
          </div>
        ))}

        {/* STATUS CARD BOBOT */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Validasi Bobot SAW</p>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                statData.bobot_valid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
              }`}>
                {statData.bobot_valid ? "VALID" : "INVALID"}
              </span>
            </div>
            <h2 className="mt-4 text-4xl font-bold text-slate-900">{statData.total_bobot}</h2>
          </div>
          <div className="mt-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div 
                className={`h-full rounded-full ${statData.bobot_valid ? "bg-emerald-500" : "bg-rose-500"}`}
                style={{ width: `${Math.min(statData.total_bobot * 100, 100)}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">Total kriteria harus bernilai 1.0</p>
          </div>
        </div>
      </div>

      {/* SECTION LOWER: DISTRIBUSI & PROGRESS */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* DISTRIBUSI REKOMENDASI JURUSAN */}
        <section className="lg:col-span-1 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex h-3 w-3 rounded-full bg-indigo-500"></span>
            <h2 className="text-sm font-bold text-slate-900">Distribusi Rekomendasi</h2>
          </div>
          <div className="space-y-4">
            {distribusi.length > 0 ? (
              distribusi.map((item) => (
                <div key={item.kode_jurusan} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700 truncate max-w-[180px]">{item.nama_jurusan}</span>
                    <span className="text-slate-900 font-semibold">{item.persentase}% ({item.jumlah_siswa} Siswa)</span>
                  </div>
                  <div className="relative overflow-hidden rounded-full bg-slate-100 h-2.5">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${item.persentase}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400">Rerata Skor: {item.rata_skor}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 text-center py-6">Belum ada data distribusi.</p>
            )}
          </div>
        </section>

        {/* PROGRESS KELENGKAPAN DATA SISWA */}
        <section className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex h-3 w-3 rounded-full bg-sky-500"></span>
            <h2 className="text-sm font-bold text-slate-900">Progress Kelengkapan Data Siswa</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-semibold">Nama Siswa</th>
                  <th className="pb-3 font-semibold text-center">Kelas</th>
                  <th className="pb-3 font-semibold text-center">Bakat</th>
                  <th className="pb-3 font-semibold text-center">Minat</th>
                  <th className="pb-3 font-semibold text-center">Rapor</th>
                  <th className="pb-3 font-semibold text-center">Status SAW</th>
                  <th className="pb-3 font-semibold text-right">Kelengkapan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {progressSiswa.length > 0 ? (
                  progressSiswa.map((siswa) => (
                    <tr key={siswa.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-medium text-slate-900">{siswa.nama}</td>
                      <td className="py-3 text-center">{siswa.kelas}</td>
                      <td className="py-3 text-center">
                        {siswa.survei_bakat ? <CheckCircle2 className="h-4 w-4 mx-auto text-emerald-500" /> : <XCircle className="h-4 w-4 mx-auto text-slate-300" />}
                      </td>
                      <td className="py-3 text-center">
                        {siswa.survei_minat ? <CheckCircle2 className="h-4 w-4 mx-auto text-emerald-500" /> : <XCircle className="h-4 w-4 mx-auto text-slate-300" />}
                      </td>
                      <td className="py-3 text-center">
                        {siswa.punya_nilai ? <CheckCircle2 className="h-4 w-4 mx-auto text-emerald-500" /> : <XCircle className="h-4 w-4 mx-auto text-slate-300" />}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          siswa.sudah_dihitung ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {siswa.sudah_dihitung ? "Selesai" : "Belum"}
                        </span>
                      </td>
                      <td className="py-3 text-right font-bold text-slate-900">{siswa.kelengkapan_persen}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">Belum ada data progres siswa.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}