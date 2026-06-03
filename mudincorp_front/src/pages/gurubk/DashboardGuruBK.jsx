import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import DashboardPage from "../admin/components/DashboardPage.jsx";
import LaporanPage from "../admin/components/LaporanPage.jsx";
import SAWProcessPage from "../admin/components/SAWProcessPage.jsx";
import InputBakatMinat from "../admin/InputBakatMinat.jsx";
import KelolaUser from "../admin/KelolaUser.jsx";
import KriteriaPage from "../admin/KriteriaPage.jsx";
import NilaiRaporPage from "../admin/NilaiRaporPage.jsx";
import SiswaPage from "../admin/SiswaPage.jsx";
// 1. IMPORT KOMPONEN JURUSAN ANDA DI SINI (Sesuaikan nama file & jalurnya)
import JurusanPage from "../admin/jurusan.jsx"; 

const pathToPage = {
  "/gurubk": "dashboard",
  "/gurubk/users": "user",         // Tambahkan ini
  "/gurubk/siswa": "siswa",         // Tambahkan ini
  "/gurubk/jurusan": "jurusan",     // <--- INI DIA YANG BIKIN PUTIH
  "/gurubk/kriteria": "kriteria",   // Tambahkan ini
  "/gurubk/nilai-rapor": "nilai",   // Tambahkan ini
  "/gurubk/saw-process": "saw-process",
  "/gurubk/laporan": "laporan",     // Tambahkan ini
};

const pageComponents = {
  dashboard: DashboardPage,
  siswa: SiswaPage,
  user: KelolaUser,
  jurusan: JurusanPage,
  kriteria: KriteriaPage,
  laporan: LaporanPage,
  nilai: NilaiRaporPage,
  "bakat-minat": InputBakatMinat,
  "saw-process": SAWProcessPage,
};

export default function DashboardGuruBK() {
  const location = useLocation();
  const pageKey = useMemo(
    // Jika path tidak terdaftar, pastikan defaultnya tidak bikin blank
    () => pathToPage[location.pathname] ?? "dashboard",
    [location.pathname],
  );
  const [activePage, setActivePage] = useState(pageKey);

  useEffect(() => {
    setActivePage(pageKey);
  }, [pageKey]);

  const ActivePage = pageComponents[activePage] ?? DashboardPage;

  return (
    <div className="h-full">
      <ActivePage />
    </div>
  );
}