import {User,Mail,Phone,MapPin,GraduationCap,Camera,Save,Edit2,ShieldCheck,ClipboardCheck,School,BookOpen} from "lucide-react";
import { useState, useEffect } from "react";
// Import disesuaikan dengan path Anda
import { profileService } from "../../services/profileService"; 

export default function ProfilSiswa() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "Eky Sulistiyo",
    nisn: "3174091203990002",
    email: "ekysulistiyo@gmail.com",
    phone: "081234567890",
    gender: "Laki-laki",
    school: "SMA Negeri 1 Madiun",
    class: "XII MIPA 3",
    address: "Jl. Serayu No. 10, Kota Madiun, Jawa Timur",
    foto: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    getProfilSiswa();
  }, []);

const getProfilSiswa = async () => {
    try {
      const response = await profileService.getProfile();
      if (response.success) {
        const siswa = response.data;
        setFormData({
          name: siswa.nama || "",
          nisn: siswa.nisn || "",
          email: siswa.email || "",
          phone: siswa.no_telp || "",
          gender: siswa.jenis_kelamin || "Laki-laki",
          school: siswa.sekolah_asal || "SMA Negeri 1 Madiun",
          class: `${siswa.kelas || ""} ${siswa.jurusan || ""}`.trim() || "XII MIPA 3",
          address: siswa.alamat || "",
          foto: siswa.foto || null,
        });

        if (siswa.foto) {
          setImagePreview(`http://localhost:8000/storage/${siswa.foto}`);
        }

        // ✅ TAMBAHAN: sinkron localStorage setiap kali profil di-load, bukan hanya saat edit
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = {
          ...currentUser,
          name: siswa.nama,
          foto: siswa.foto,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("profile-updated"));
      }
    } catch (error) {
      console.error("Gagal memuat data profil:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, foto: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: "", text: "" });

    try {
      const dataToSend = new FormData();
      dataToSend.append("nama", formData.name);
      dataToSend.append("email", formData.email);
      dataToSend.append("no_telp", formData.phone);
      dataToSend.append("alamat", formData.address);
      
      if (formData.foto instanceof File) {
        dataToSend.append("foto", formData.foto);
      }

      const response = await profileService.updateProfile(dataToSend);
      if (response.success) {
        setStatusMessage({ type: "success", text: "Profil berhasil diperbarui!" });
        setIsEditing(false);

        // ✅ TAMBAHAN: sinkronkan localStorage agar dashboard ikut update
        const siswa = response.data;
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = {
          ...currentUser,
          name: siswa.nama,
          foto: siswa.foto,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // ✅ TAMBAHAN: broadcast event agar komponen lain (dashboard) ikut re-render
        window.dispatchEvent(new Event("profile-updated"));

        getProfilSiswa();
      }
    } catch (error) {
      setStatusMessage({ 
        type: "error", 
        text: error.message || "Gagal menyimpan perubahan profil." 
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 animate-in fade-in duration-500 font-sans">
      
      {/* ── Header Banner ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-b-3xl sm:rounded-none shadow-sm">
        {/* Dekorasi Background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.3),transparent_60%)]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 px-6 py-8 md:px-10 lg:py-12 max-w-[1600px] mx-auto w-full flex flex-col md:flex-row items-center md:items-start gap-6 lg:gap-8">
          
          {/* Avatar Profile */}
          <div className="relative group flex-shrink-0">
            <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl bg-white p-1 shadow-2xl border border-white/20 overflow-hidden flex items-center justify-center transition-transform hover:scale-105 duration-300">
              {imagePreview ? (
                <img src={imagePreview} alt="Profil" className="h-full w-full rounded-xl object-cover" />
              ) : (
                <div className="h-full w-full rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 font-extrabold text-4xl sm:text-5xl">
                  {formData.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 p-2.5 rounded-full bg-blue-600 text-white shadow-lg border-4 border-blue-900 hover:bg-blue-500 hover:scale-110 transition-all cursor-pointer">
              <Camera size={16} />
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {/* User Meta Information */}
          <div className="text-white flex-1 text-center md:text-left w-full">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2 justify-center md:justify-start">
              <span className="inline-flex items-center w-max mx-auto md:mx-0 text-[11px] font-bold uppercase tracking-wider text-emerald-200 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
                Siswa Aktif
              </span>
              <p className="text-blue-200/80 text-sm font-medium">NISN: {formData.nisn}</p>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-5 drop-shadow-sm">
              {formData.name}
            </h1>

            {/* Grid Detail Info Cepat */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm bg-black/10 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-3 text-blue-100">
                <div className="p-2 bg-white/10 rounded-lg text-blue-300"><Mail size={16} /></div>
                <div className="truncate">
                  <p className="text-[11px] text-blue-300/70 font-semibold uppercase tracking-wider">Email</p>
                  <p className="font-medium truncate">{formData.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-blue-100">
                <div className="p-2 bg-white/10 rounded-lg text-blue-300"><Phone size={16} /></div>
                <div>
                  <p className="text-[11px] text-blue-300/70 font-semibold uppercase tracking-wider">No. HP</p>
                  <p className="font-medium">{formData.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-blue-100">
                <div className="p-2 bg-white/10 rounded-lg text-blue-300"><School size={16} /></div>
                <div className="truncate">
                  <p className="text-[11px] text-blue-300/70 font-semibold uppercase tracking-wider">Sekolah</p>
                  <p className="font-medium truncate">{formData.school}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-blue-100">
                <div className="p-2 bg-white/10 rounded-lg text-blue-300"><BookOpen size={16} /></div>
                <div>
                  <p className="text-[11px] text-blue-300/70 font-semibold uppercase tracking-wider">Kelas</p>
                  <p className="font-medium">{formData.class}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content Area ── */}
      <div className="px-6 md:px-10 py-8 max-w-[1600px] mx-auto space-y-6">
        
        {/* Banner Alert Notifikasi */}
        {statusMessage.text && (
          <div className={`p-4 rounded-xl font-medium text-sm flex items-center gap-3 shadow-sm transition-all ${statusMessage.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
            {statusMessage.type === "success" ? <ShieldCheck size={20} /> : <ClipboardCheck size={20} />}
            {statusMessage.text}
          </div>
        )}

        <div className="grid gap-8 grid-cols-1 lg:grid-cols-12 items-start">
          
          {/* ── Kolom Kiri: Verifikasi Sistem ── */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
              <h3 className="font-bold text-slate-800 text-base mb-5 flex items-center gap-2">
                <ShieldCheck size={20} className="text-blue-500" />
                Status Verifikasi
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 rounded-xl bg-emerald-50/50 border border-emerald-100 p-4 transition-colors hover:bg-emerald-50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 flex-shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Akun Terverifikasi</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">Terhubung secara otomatis dengan sistem Dapodik & BK sekolah.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl bg-amber-50/50 border border-amber-100 p-4 transition-colors hover:bg-amber-50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 flex-shrink-0">
                    <ClipboardCheck size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Status Pengisian</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">Nilai rapor telah terisi, namun survei minat & bakat belum diselesaikan.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Kolom Kanan: Form Kelola Data Diri ── */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-100 pb-5">
              <div>
                <h3 className="font-bold text-slate-800 text-lg tracking-tight">
                  Informasi Data Diri
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Kelola data pribadi dan informasi akademik Anda dengan lengkap.
                </p>
              </div>
              
              {/* Tombol Aksi */}
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-50 text-blue-600 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-blue-100 hover:text-blue-700"
                >
                  <Edit2 size={16} />
                  Edit Profil
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => { setIsEditing(false); getProfilSiswa(); }}
                    className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 transition hover:bg-slate-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    form="profileForm"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <Save size={16} />
                    Simpan Perubahan
                  </button>
                </div>
              )}
            </div>

            <form id="profileForm" onSubmit={handleSubmit} className="space-y-8">
              
              {/* Seksi 1: Data Pribadi */}
              <div className="space-y-5">
                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 border-b border-slate-50 pb-2">
                  <User size={16} className="text-blue-500" /> Data Pribadi
                </h4>
                
                <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Nama Lengkap</label>
                    <input
                      type="text"
                      name="name"
                      disabled={!isEditing}
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 outline-none transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">NISN</label>
                    <input
                      type="text"
                      name="nisn"
                      disabled
                      value={formData.nisn}
                      className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-sm font-medium text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isEditing ? 'text-blue-500' : 'text-slate-400'}`} />
                      <input
                        type="email"
                        name="email"
                        disabled={!isEditing}
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 outline-none transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Nomor Telepon / WhatsApp</label>
                    <div className="relative">
                      <Phone size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isEditing ? 'text-blue-500' : 'text-slate-400'}`} />
                      <input
                        type="text"
                        name="phone"
                        disabled={!isEditing}
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 outline-none transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-100"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Alamat Tempat Tinggal</label>
                    <div className="relative">
                      <MapPin size={16} className={`absolute left-4 top-3.5 ${isEditing ? 'text-blue-500' : 'text-slate-400'}`} />
                      <textarea
                        name="address"
                        rows="3"
                        disabled={!isEditing}
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 outline-none transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-100 resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seksi 2: Informasi Akademik */}
              <div className="space-y-5 pt-2">
                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 border-b border-slate-50 pb-2">
                  <GraduationCap size={18} className="text-blue-500" /> Data Sekolah & Akademik
                </h4>
                
                <div className="grid gap-5 grid-cols-1 md:grid-cols-2 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Sekolah Asal</label>
                    <input
                      type="text"
                      disabled
                      value={formData.school}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200/50 bg-white text-sm font-medium text-slate-600 shadow-sm cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Kelas / Jurusan SMA</label>
                    <input
                      type="text"
                      disabled
                      value={formData.class}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200/50 bg-white text-sm font-medium text-slate-600 shadow-sm cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}