import React, { useState } from "react";
import {BookOpen,CheckCircle2,ChevronDown,ChevronUp,ClipboardList,HelpCircle,Info,Lightbulb,MessageCircle,Search,ShieldCheck,Star,UserCheck,Heart} from "lucide-react";
export default function PanduanSiswa() {
  const [activeFaq, setActiveFaq] = useState(null);

  // ── KONFIGURASI WHATSAPP ──
  // Silakan ganti nomor di bawah ini (Gunakan format 62, jangan gunakan 0 atau +)
  const noAdmin = "6281234567890"; 
  const noGuruBK = "6289876543210";

  // Template pesan otomatis saat chat dibuka
  const pesanAdmin = encodeURIComponent("Halo Admin UNIPMA, saya mengalami kendala teknis terkait pengisian data di sistem pemilihan jurusan.");
  const pesanBK = encodeURIComponent("Assalamualaikum Wr. Wb. Bapak/Ibu Guru BK, saya ingin berkonsultasi mengenai proses pengisian survei minat dan bakat.");

  const steps = [
    {
      title: "Verifikasi Nilai Rapor",
      desc: "Langkah pertama adalah memastikan nilai akademik Anda sudah diinput oleh Admin atau Guru BK. Anda dapat mengecek status ini di Dashboard.",
      icon: UserCheck,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Pengisian Survei Bakat",
      desc: "Jawablah pertanyaan mengenai potensi diri Anda. Tidak ada jawaban salah, pilihlah yang paling mencerminkan kemampuan Anda.",
      icon: Lightbulb,
      color: "bg-violet-50 text-violet-600",
    },
    {
      title: "Pengisian Survei Minat",
      desc: "Pilih pernyataan yang sesuai dengan ketertarikan Anda terhadap bidang tertentu. Ini membantu sistem memahami gairah karir Anda.",
      icon: Heart, 
      color: "bg-rose-50 text-rose-600",
    },
    {
      title: "Analisis & Rekomendasi",
      desc: "Setelah data lengkap, tekan tombol 'Hitung' di halaman Hasil. Sistem SAW akan memproses nilai rapor, minat, dan bakat Anda secara otomatis.",
      icon: Star,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  const faqs = [
    {
      q: "Mengapa saya tidak bisa mengisi survei?",
      a: "Survei hanya dapat diakses jika Nilai Rapor Anda sudah diinput oleh Guru BK atau Admin. Jika status di dashboard masih 'Belum Ada', silakan hubungi pihak sekolah.",
    },
    {
      q: "Apakah saya bisa mengubah jawaban survei?",
      a: "Jawaban survei yang sudah dikirim (Submit) tidak dapat diubah kembali. Pastikan Anda memeriksa ulang semua jawaban sebelum menekan tombol kirim.",
    },
    {
      q: "Apa itu Metode SAW yang digunakan sistem ini?",
      a: "Simple Additive Weighting (SAW) adalah metode penjumlahan terbobot. Sistem mencari penjumlahan terbobot dari rating kinerja pada setiap alternatif (jurusan) di semua atribut kriteria.",
    },
    {
      q: "Bagaimana jika hasil rekomendasi tidak sesuai keinginan saya?",
      a: "Hasil rekomendasi bersifat saran objektif berdasarkan data nilai dan survei. Keputusan akhir tetap berada di tangan Anda, namun jadikan hasil ini sebagai bahan pertimbangan yang matang.",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-6 pb-16 pt-24 animate-in fade-in duration-700">
      
      {/* ── HEADER ── */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700 uppercase tracking-wider">
          <BookOpen size={14} /> Pusat Panduan Siswa
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
          Bagaimana Cara Menggunakan Sistem?
        </h1>
        <p className="mx-auto max-w-2xl text-sm md:text-base font-medium text-slate-500 leading-relaxed">
          Ikuti langkah-langkah di bawah ini untuk mendapatkan hasil analisis jurusan yang akurat berdasarkan potensi akademik dan kepribadian Anda.
        </p>
      </div>

      {/* ── STEPPER WORKFLOW ── */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 relative">
        {steps.map((step, idx) => (
          <div key={idx} className="group relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${step.color} shadow-sm transition-transform group-hover:scale-110`}>
              {/* Otomatis menggunakan icon dari array tanpa hardcode kondisi */}
              <step.icon size={24} />
            </div>
            <div className="absolute top-6 right-6 text-2xl font-black text-slate-100 group-hover:text-blue-50">
              0{idx + 1}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
            <p className="text-xs md:text-sm font-medium text-slate-500 leading-relaxed">
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      {/* ── DUA KOLOM INFO ── */}
      <div className="grid gap-8 md:grid-cols-2 items-stretch">
        {/* Tips Pengisian */}
        <div className="rounded-[32px] bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 night-0 p-8 opacity-10">
            <Search size={120} />
          </div>
          <h3 className="text-xl font-extrabold mb-4 flex items-center gap-2">
            <Star className="text-yellow-300" fill="currentColor" size={20} />
            Tips Agar Hasil Akurat
          </h3>
          <ul className="space-y-4">
            {[
              "Pastikan koneksi internet stabil saat mengisi survei.",
              "Cari tempat yang tenang agar Anda bisa fokus memahami pertanyaan.",
              "Jawablah secara jujur, bukan berdasarkan pilihan teman.",
              "Gunakan perangkat layar lebar (Laptop/Tablet) untuk kenyamanan."
            ].map((text, i) => (
              <li key={i} className="flex gap-3 text-sm font-medium text-blue-50">
                <CheckCircle2 size={18} className="shrink-0 text-sky-300" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Mengenal Kriteria */}
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <h3 className="text-xl font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <Info className="text-blue-600" size={20} />
            Mengenal Kriteria Penilaian
          </h3>
          <div className="space-y-4">
            <div className="flex gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm font-bold">A</div>
              <div>
                <p className="text-sm font-bold text-slate-800">Nilai Academic</p>
                <p className="text-xs text-slate-500 mt-0.5">Rata-rata nilai rapor semester terakhir sebagai fondasi kognitif.</p>
              </div>
            </div>
            <div className="flex gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-white flex items-center justify-center text-rose-600 shadow-sm font-bold">B</div>
              <div>
                <p className="text-sm font-bold text-slate-800">Survei Minat & Bakat</p>
                <p className="text-xs text-slate-500 mt-0.5">Kecenderungan psikologis dan potensi keterampilan non-akademik.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FAQ SECTION ── */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <HelpCircle className="text-blue-600" size={24} />
          <h2 className="text-2xl font-extrabold text-slate-900">Pertanyaan Sering Diajukan (FAQ)</h2>
        </div>
        
        <div className="grid gap-3">
          {faqs.map((faq, index) => (
            <div key={index} className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all">
              <button
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-slate-50"
              >
                <span className="text-sm md:text-base font-bold text-slate-800">{faq.q}</span>
                {activeFaq === index ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
              </button>
              {activeFaq === index && (
                <div className="px-6 pb-5 pt-0 text-sm font-medium text-slate-500 leading-relaxed animate-in slide-in-from-top-2">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── SUPPORT CARD (SUDAH DIPERBAIKI) ── */}
      <div className="rounded-[32px] border border-blue-100 bg-blue-50/50 p-8 text-center border-dashed">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
          <MessageCircle size={28} />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Masih Butuh Bantuan?</h3>
        <p className="mt-2 text-sm font-medium text-slate-500 max-w-md mx-auto">
          Jika Anda mengalami kendala teknis atau kesalahan data nilai, silakan hubungi Guru BK di ruang konseling atau melalui kontak Admin UNIPMA.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          {/* Link Link WhatsApp Admin */}
          <a
            href={`https://wa.me/${noAdmin}?text=${pesanAdmin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-white border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition inline-flex items-center"
          >
            Hubungi Admin
          </a>
          {/* Link Link WhatsApp Guru BK */}
          <a
            href={`https://wa.me/${noGuruBK}?text=${pesanBK}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition inline-flex items-center"
          >
            Lihat Kontak BK
          </a>
        </div>
      </div>

      <div className="text-center pt-4">
        <p className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.2em]">Sistem Pendukung Keputusan Pemilihan Jurusan • UNIPMA 2024</p>
      </div>

    </div>
  );
}