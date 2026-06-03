import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import client from "../../../services/authService.js";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState({
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

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const response = await client.get(
        "/dashboard/statistik",
      );

      setData(response.data);
    } catch (error) {
      console.error(
        "Gagal memuat dashboard",
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: "Total Siswa",
      value: data.total_siswa,
      desc: "Jumlah seluruh siswa",
    },

    {
      title: "Jurusan Aktif",
      value: data.total_jurusan_aktif,
      desc: "Jurusan tersedia",
    },

    {
      title: "Kriteria Aktif",
      value: data.total_kriteria_aktif,
      desc: "Kriteria metode SAW",
    },

    {
      title: "Sudah Dihitung",
      value: data.sudah_dihitung,
      desc: "Siswa sudah diproses SAW",
    },

    {
      title: "Belum Dihitung",
      value: data.belum_dihitung,
      desc: "Belum diproses SAW",
    },

    {
      title: "Survei Bakat",
      value: data.sudah_survei_bakat,
      desc: "Sudah isi survei bakat",
    },

    {
      title: "Survei Minat",
      value: data.sudah_survei_minat,
      desc: "Sudah isi survei minat",
    },

    {
      title: "Total Bobot",
      value: data.total_bobot,
      desc: data.bobot_valid
        ? "Bobot valid"
        : "Bobot belum valid",
    },
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
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Statistik sistem pendukung keputusan
          pemilihan jurusan.
        </p>
      </div>

      {/* CARD */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">
              {card.title}
            </p>

            <h2 className="mt-4 text-4xl font-bold text-slate-900">
              {card.value}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {card.desc}
            </p>
          </div>
        ))}
      </div>

      {/* STATUS BOBOT */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Validasi Bobot SAW
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Total bobot seluruh kriteria harus
              bernilai 1.
            </p>
          </div>

          <div
            className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
              data.bobot_valid
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {data.bobot_valid
              ? "VALID"
              : "BELUM VALID"}
          </div>
        </div>

        <div className="mt-5">
          <div className="h-4 overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full ${
                data.bobot_valid
                  ? "bg-emerald-500"
                  : "bg-rose-500"
              }`}
              style={{
                width: `${Math.min(
                  data.total_bobot * 100,
                  100,
                )}%`,
              }}
            />
          </div>

          <p className="mt-3 text-sm text-slate-600">
            Total Bobot :
            <span className="ml-2 font-semibold">
              {data.total_bobot}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}