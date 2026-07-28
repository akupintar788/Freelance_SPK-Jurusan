import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout.jsx";
import GuruBKLayout from "./layouts/GuruBKLayout.jsx";
import SiswaLayout from "./layouts/SiswaLayout.jsx";
import DashboardPage from "./pages/admin/components/DashboardPage.jsx";
import LaporanPage from "./pages/admin/components/LaporanPage.jsx";
import SAWProcessPage from "./pages/admin/components/SAWProcessPage.jsx";
import InputBakatMinat from "./pages/admin/InputBakatMinat.jsx";
import JurusanPage from "./pages/admin/jurusan.jsx";
import KelolaUser from "./pages/admin/KelolaUser.jsx";
import KriteriaPage from "./pages/admin/KriteriaPage.jsx";
import NilaiRaporPage from "./pages/admin/NilaiRaporPage.jsx";
import SiswaPage from "./pages/admin/SiswaPage.jsx";
import LoginPage from "./pages/auth/login.jsx";
import DashboardGuruBK from "./pages/gurubk/DashboardGuruBK.jsx";
import DashboardSiswa from "./pages/siswa/DashboardSiswa.jsx";
import HasilRekomendasi from "./pages/siswa/HasilRekomendasi.jsx";
import PanduanSiswa from "./pages/siswa/PanduanSiswa.jsx";
import ProfilSiswa from "./pages/siswa/ProfilSiswa.jsx";
import SurveiSiswa from "./pages/siswa/SurveiSiswa.jsx";
import SurveiBakat from "./pages/siswa/SurveiBakat.jsx";
import SurveiMinat from "./pages/siswa/SurveiMinat.jsx";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        <Route
          path="/admin"
          element={
            <AdminLayout>
              <DashboardPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminLayout>
              <KelolaUser />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/siswa"
          element={
            <AdminLayout>
              <SiswaPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/kriteria"
          element={
            <AdminLayout>
              <KriteriaPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/jurusan"
          element={
            <AdminLayout>
              <JurusanPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/laporan"
          element={
            <AdminLayout>
              <LaporanPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/nilai-rapor"
          element={
            <AdminLayout>
              <NilaiRaporPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/survei-bakat"
          element={
            <AdminLayout>
              <InputBakatMinat lockedCategory="Bakat" />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/survei-minat"
          element={
            <AdminLayout>
              <InputBakatMinat lockedCategory="Minat" />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/bobot-jurusan"
          element={<AdminLayout></AdminLayout>}
        />
        <Route
          path="/admin/saw-process"
          element={
            <AdminLayout>
              <SAWProcessPage />
            </AdminLayout>
          }
        />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route
          path="/auth/register"
          element={<Navigate to="/auth/login" replace />}
        />
        <Route
          path="/gurubk"
          element={
            <GuruBKLayout>
              <DashboardGuruBK />
            </GuruBKLayout>
          }
        />
        <Route
          path="/gurubk/users"
          element={
            <GuruBKLayout>
              <KelolaUser />
            </GuruBKLayout>
          }
        />
        <Route
          path="/gurubk/siswa"
          element={
            <GuruBKLayout>
              <SiswaPage />
            </GuruBKLayout>
          }
        />
        <Route
          path="/gurubk/kriteria"
          element={
            <GuruBKLayout>
              <KriteriaPage />
            </GuruBKLayout>
          }
        />
        <Route
          path="/gurubk/jurusan"
          element={
            <GuruBKLayout>
              <JurusanPage />
            </GuruBKLayout>
          }
        />
        <Route
          path="/gurubk/laporan"
          element={
            <GuruBKLayout>
              <LaporanPage />
            </GuruBKLayout>
          }
        />
        <Route
          path="/gurubk/nilai-rapor"
          element={
            <GuruBKLayout>
              <NilaiRaporPage />
            </GuruBKLayout>
          }
        />
        <Route
          path="/gurubk/survei-bakat"
          element={
            <GuruBKLayout>
              <InputBakatMinat lockedCategory="Bakat" />
            </GuruBKLayout>
          }
        />
        <Route
          path="/gurubk/survei-minat"
          element={
            <GuruBKLayout>
              <InputBakatMinat lockedCategory="Minat" />
            </GuruBKLayout>
          }
        />
        <Route
          path="/gurubk/saw-process"
          element={
            <GuruBKLayout>
              <SAWProcessPage />
            </GuruBKLayout>
          }
        />
        <Route
          path="/siswa"
          element={
            <SiswaLayout>
              <DashboardSiswa />
            </SiswaLayout>
          }
        />
        <Route
          path="/siswa/survei"
          element={<Navigate to="/siswa/survei/bakat" replace />}
        />
        <Route
          path="/siswa/survei/bakat"
          element={
            <SiswaLayout>
              <SurveiBakat />
            </SiswaLayout>
          }
        />
        <Route
          path="/siswa/survei/minat"
          element={
            <SiswaLayout>
              <SurveiMinat />
            </SiswaLayout>
          }
        />
        <Route
          path="/siswa/hasil"
          element={
            <SiswaLayout>
              <HasilRekomendasi />
            </SiswaLayout>
          }
        />
        <Route
          path="/siswa/profil"
          element={
            <SiswaLayout>
              <ProfilSiswa />
            </SiswaLayout>
          }
        />
        <Route
          path="/siswa/panduan"
          element={
            <SiswaLayout>
              <PanduanSiswa />
            </SiswaLayout>
          }
        />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
