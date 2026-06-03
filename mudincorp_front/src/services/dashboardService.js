import client from "./authService.js"; 

// Hapus fungsi pengecekan role, patenkan prefix ke "/admin" 
// karena backend menyatukan route Admin & Guru BK di prefix ini.
const PREFIX = "/admin"; 

const dashboardService = {
  getStatistik: async () => {
    // Memanggil: GET /api/admin/dashboard/statistik
    return await client.get(`${PREFIX}/dashboard/statistik`);
  },

  getDistribusiJurusan: async () => {
    // Memanggil: GET /api/admin/dashboard/distribusi-jurusan
    return await client.get(`${PREFIX}/dashboard/distribusi-jurusan`);
  },

  getProgressSiswa: async (perPage = 5) => {
    // Memanggil: GET /api/admin/dashboard/progress-siswa?per_page=5
    return await client.get(`${PREFIX}/dashboard/progress-siswa?per_page=${perPage}`);
  }
};

export default dashboardService;