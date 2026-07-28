import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  HelpCircle,
  Lock,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  fetchPertanyaanSurvei,
  submitSurvei,
} from "../../services/siswaSurveiService.js";

const optionValues = [
  { label: "Sangat Sesuai", value: 5 },
  { label: "Sesuai", value: 4 },
  { label: "Cukup Sesuai", value: 3 },
  { label: "Kurang Sesuai", value: 2 },
  { label: "Tidak Sesuai", value: 1 },
];

// Helper: key localStorage per user (sama dengan SurveiBakat)
const getBakatKey = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return `survei_bakat_selesai_${user.id || "guest"}`;
  } catch {
    return "survei_bakat_selesai_guest";
  }
};

export default function SurveiMinat() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentStep, setCurrentStep] = useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [blockedByBakat, setBlockedByBakat] = useState(false);
  const [blockedByRapor, setBlockedByRapor] = useState(false);

  useEffect(() => {
    // ── GUARD FRONTEND: cek localStorage sebelum fetch apapun ──
    if (localStorage.getItem(getBakatKey()) !== "1") {
      setBlockedByBakat(true);
      setLoading(false);
      return;
    }
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError("");
      setBlockedByBakat(false);
      setBlockedByRapor(false);

      const minatData = await fetchPertanyaanSurvei("minat");
      setQuestions(
        Array.isArray(minatData)
          ? minatData.map((item) => ({ ...item, kategori: "Minat" }))
          : []
      );
    } catch (err) {
      if (err.response?.status === 403) {
        const msg = err.response?.data?.message || "";
        // Cek apakah blocked karena bakat belum selesai atau rapor belum ada
        if (
          msg.toLowerCase().includes("bakat") ||
          msg.toLowerCase().includes("selesaikan")
        ) {
          setBlockedByBakat(true);
          await Swal.fire({
            icon: "warning",
            title: "Selesaikan Survei Bakat Terlebih Dahulu",
            text: msg || "Anda wajib menyelesaikan survei bakat sebelum mengakses survei minat.",
            confirmButtonColor: "#f59e0b",
            confirmButtonText: "Ke Survei Bakat",
          });
          navigate("/siswa/survei/bakat");
          return;
        }

        setBlockedByRapor(true);
        await Swal.fire({
          icon: "warning",
          title: "Nilai Rapor Belum Diinput",
          text: msg || "Nilai rapor Anda belum diinput oleh Admin/Guru BK. Silakan lapor terlebih dahulu.",
          confirmButtonColor: "#f59e0b",
          confirmButtonText: "Kembali ke Dashboard",
        });
        navigate("/siswa");
        return;
      }
      const pesanError =
        err.response?.data?.message || "Gagal memuat data survei dari server.";
      setError(pesanError);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep((prev) => prev + 1), 250);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const unansweredCount = questions.filter((q) => !answers[q.id]).length;

    if (unansweredCount > 0) {
      await Swal.fire({
        icon: "warning",
        title: "Jawaban Belum Lengkap",
        text: `Masih ada ${unansweredCount} pertanyaan yang belum dijawab. Silakan lengkapi terlebih dahulu.`,
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    const konfirmasi = await Swal.fire({
      icon: "question",
      title: "Kirim Jawaban Minat?",
      text: "Jawaban survei minat akan disimpan. Hasil rekomendasi jurusan Anda siap dilihat setelah ini.",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Kirim",
      cancelButtonText: "Periksa Lagi",
    });

    if (!konfirmasi.isConfirmed) return;

    setSubmitting(true);
    try {
      const formatJawaban = Object.keys(answers).map((id) => ({
        pertanyaan_id: parseInt(id),
        skor: parseInt(answers[id]),
      }));

      await submitSurvei({ tipe: "minat", jawaban: formatJawaban });
      setSuccess(true);

      await Swal.fire({
        icon: "success",
        title: "Survei Selesai!",
        text: "Kedua bagian survei telah selesai. Hasil rekomendasi jurusan siap dilihat.",
        confirmButtonColor: "#059669",
        confirmButtonText: "Lihat Hasil",
      });

      navigate("/siswa/hasil");
    } catch (err) {
      console.error("Submit error:", err.response?.data);

      if (err.response?.status === 403) {
        const msg = err.response?.data?.message || "";
        if (
          msg.toLowerCase().includes("bakat") ||
          msg.toLowerCase().includes("selesaikan")
        ) {
          await Swal.fire({
            icon: "warning",
            title: "Selesaikan Survei Bakat Terlebih Dahulu",
            text: msg,
            confirmButtonColor: "#f59e0b",
            confirmButtonText: "Ke Survei Bakat",
          });
          navigate("/siswa/survei/bakat");
          return;
        }
        await Swal.fire({
          icon: "warning",
          title: "Nilai Rapor Belum Diinput",
          text: msg || "Nilai rapor Anda belum diinput. Silakan lapor ke Admin/Guru BK.",
          confirmButtonColor: "#f59e0b",
        });
        navigate("/siswa");
        return;
      }

      if (err.response?.status === 422) {
        const errData = err.response.data;
        let pesanValidasi = "Terjadi kesalahan validasi.";
        if (errData?.errors) {
          const firstKey = Object.keys(errData.errors)[0];
          pesanValidasi = Array.isArray(errData.errors[firstKey])
            ? errData.errors[firstKey][0]
            : pesanValidasi;
        } else if (errData?.message) {
          pesanValidasi = errData.message;
        }
        await Swal.fire({
          icon: "error",
          title: "Validasi Gagal",
          text: pesanValidasi,
          confirmButtonColor: "#dc2626",
        });
        return;
      }

      await Swal.fire({
        icon: "error",
        title: "Gagal Mengirim",
        text:
          err.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan survei. Silakan coba lagi.",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const totalProgress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
  const currentQuestion = questions[currentStep];

  const jumpToFirstUnanswered = () => {
    const idx = questions.findIndex((q) => !answers[q.id]);
    if (idx !== -1) setCurrentStep(idx);
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex min-h-[500px] pt-24 flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={42} />
        <p className="text-sm font-semibold text-slate-500 animate-pulse">
          Memuat pertanyaan survei minat...
        </p>
      </div>
    );
  }

  // ── Blocked by bakat (frontend guard) ──
  if (blockedByBakat) {
    return (
      <div className="mx-auto max-w-2xl pt-24 px-4">
        <div className="rounded-[32px] border border-amber-200 bg-gradient-to-b from-amber-50 to-orange-50/20 p-10 text-center shadow-lg">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
            <Lock size={38} />
          </div>
          <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900">
            Survei Bakat Belum Selesai
          </h2>
          <p className="mt-3 text-sm font-medium text-slate-600 leading-relaxed max-w-md mx-auto">
            Anda harus menyelesaikan survei bakat terlebih dahulu sebelum dapat mengakses survei minat.
          </p>
          <button
            onClick={() => navigate("/siswa/survei/bakat")}
            className="mt-8 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-violet-700"
          >
            Kerjakan Survei Bakat
          </button>
        </div>
      </div>
    );
  }

  // ── Blocked by rapor ──
  if (blockedByRapor) {
    return (
      <div className="mx-auto max-w-2xl pt-24 px-4">
        <div className="rounded-[32px] border border-amber-200 bg-gradient-to-b from-amber-50 to-orange-50/20 p-10 text-center shadow-lg">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
            <AlertCircle size={38} />
          </div>
          <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900">
            Nilai Rapor Belum Diinput
          </h2>
          <p className="mt-3 text-sm font-medium text-slate-600 leading-relaxed max-w-md mx-auto">
            Untuk memulai pengisian survei, nilai rapor Anda wajib diinput
            terlebih dahulu oleh Admin atau Guru BK Anda.
          </p>
          <button
            onClick={() => navigate("/siswa")}
            className="mt-8 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-amber-600"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Success ──
  if (success) {
    return (
      <div className="mx-auto max-w-2xl pt-24 px-4">
        <div className="rounded-[32px] border border-emerald-200 bg-gradient-to-b from-emerald-50 to-emerald-50/10 p-10 text-center shadow-lg">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
            <CheckCircle2 size={38} />
          </div>
          <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900">
            Survei Selesai!
          </h2>
          <p className="mt-3 text-sm font-medium text-slate-600 leading-relaxed max-w-md mx-auto">
            Kedua bagian survei telah selesai. Hasil rekomendasi jurusan Anda
            siap untuk dilihat.
          </p>
          <button
            onClick={() => navigate("/siswa/hasil")}
            className="mt-8 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
          >
            Lihat Hasil Rekomendasi
          </button>
        </div>
      </div>
    );
  }

  // ── No questions ──
  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl pt-24 px-4">
        <div className="rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <AlertCircle size={44} className="mx-auto text-slate-400" />
          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Belum Ada Soal Survei Minat
          </h2>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
            Admin/Guru BK belum meluncurkan butir pertanyaan minat. Mohon tunggu
            informasi selanjutnya.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 pb-10 pt-24 fade-in">
      {/* ── Header ── */}
      <div className="text-center md:text-left border-b border-slate-200 pb-5">
        <div className="flex flex-wrap items-center gap-3 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 font-extrabold text-sm">
            2
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-blue-500">
            Tahap 2 dari 2
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
            <CheckCircle2 size={11} />
            Bakat Selesai ✓
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
          Survei Minat
        </h1>
        <p className="mt-1.5 text-sm font-medium text-slate-500">
          Bagian terakhir. Setelah selesai, hasil rekomendasi jurusan Anda akan
          tersedia.
        </p>
      </div>

      {/* ── Step info banner ── */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
          <Compass size={18} />
        </div>
        <div>
          <p className="text-sm font-bold text-blue-900">Survei Minat</p>
          <p className="text-xs text-blue-600">
            Ini adalah tahap terakhir. Selesaikan untuk mendapatkan rekomendasi jurusan.
          </p>
        </div>
        <div className="ml-auto rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm border border-blue-100">
          {answeredCount} / {questions.length} Terjawab
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50/70 p-4">
          <div className="flex gap-3">
            <AlertCircle size={20} className="shrink-0 text-red-500" />
            <p className="text-sm font-semibold text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* ── Total Progress ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
          <span>
            Kemajuan Minat:{" "}
            <span
              className={
                answeredCount === questions.length
                  ? "text-emerald-600 font-extrabold"
                  : "text-blue-600"
              }
            >
              {answeredCount} dari {questions.length} Terjawab
            </span>
          </span>
          <span className="font-extrabold text-slate-700">
            {Math.round(totalProgress)}%
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              totalProgress === 100
                ? "bg-emerald-500"
                : "bg-gradient-to-r from-blue-500 to-sky-600"
            }`}
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>

      {/* ── Question Card ── */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 md:p-10 shadow-xl relative overflow-hidden">
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-sky-600" />

        {/* Card header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl font-extrabold text-sm bg-blue-50 text-blue-600">
              {currentStep + 1}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Survei Minat — Soal {currentStep + 1} dari {questions.length}
              </p>
              <p className="text-sm font-semibold text-slate-600">
                Pilih jawaban yang paling mencerminkan minat Anda.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold tracking-wider uppercase bg-blue-50 text-blue-700">
            <HelpCircle size={13} />
            Minat
          </span>
        </div>

        {/* Question text */}
        <h2 className="text-xl md:text-2xl font-extrabold leading-snug text-slate-900 tracking-tight mb-4">
          {currentQuestion?.pertanyaan || "Tidak ada pertanyaan."}
        </h2>

        {/* Options */}
        <div className="mt-8 grid gap-3.5">
          {optionValues.map((option) => {
            const isSelected = answers[currentQuestion?.id] === option.value;
            return (
              <button
                key={option.value}
                onClick={() => handleSelect(currentQuestion.id, option.value)}
                className={`w-full rounded-xl border-2 px-5 py-4 text-left transition-all duration-200 flex items-center justify-between group active:scale-[0.99] ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/40 text-blue-900 shadow-sm"
                    : "border-slate-100 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-white hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                      isSelected
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white group-hover:border-slate-400"
                    }`}
                  >
                    {isSelected && (
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-bold tracking-wide ${
                      isSelected ? "text-blue-900" : "text-slate-700"
                    }`}
                  >
                    {option.label}
                  </span>
                </div>
                <span
                  className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200/60 text-slate-500 group-hover:bg-slate-200"
                  }`}
                >
                  Skor {option.value}
                </span>
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="mt-10 flex items-center justify-between border-t border-slate-100 pt-6">
          <button
            disabled={currentStep === 0}
            onClick={() => setCurrentStep((prev) => prev - 1)}
            className="flex items-center gap-1.5 text-sm font-bold text-slate-500 transition hover:text-slate-900 disabled:opacity-25"
          >
            <ChevronLeft size={18} />
            Sebelumnya
          </button>

          {currentStep === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting || questions.length === 0}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  Selesai & Lihat Hasil
                  <Send size={15} />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="flex items-center gap-1.5 text-sm font-bold text-slate-600 transition hover:text-slate-900"
            >
              Selanjutnya
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>

      {/* ── Answer Map ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Peta Lembar Jawaban — Minat
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Klik nomor di bawah untuk melompat ke soal terkait.
            </p>
          </div>
          {answeredCount < questions.length && (
            <button
              onClick={jumpToFirstUnanswered}
              className="text-left text-xs font-bold text-blue-600 transition hover:text-blue-800"
            >
              Isi Soal Kosong Pertama →
            </button>
          )}
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-2">
          {questions.map((q, idx) => {
            const hasAnswer = !!answers[q.id];
            const isCurrent = currentStep === idx;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentStep(idx)}
                title={
                  hasAnswer
                    ? `Pertanyaan ${idx + 1} (Terjawab)`
                    : `Pertanyaan ${idx + 1} (Belum Terjawab)`
                }
                className={`flex aspect-square items-center justify-center rounded-xl text-xs font-extrabold transition duration-150 ${
                  hasAnswer
                    ? "bg-blue-600 text-white shadow-xs"
                    : isCurrent
                      ? "bg-blue-50 text-blue-600 ring-2 ring-blue-500"
                      : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {answeredCount < questions.length && (
          <p className="mt-3 inline-block rounded-lg bg-amber-50/60 px-3 py-1.5 text-[11px] font-semibold text-amber-600">
            ⚠️ Masih tersisa {questions.length - answeredCount} soal belum
            diselesaikan.
          </p>
        )}
      </div>

      {/* ── Tips ── */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/60 to-sky-50/20 p-4">
        <div className="flex gap-3">
          <Sparkles className="shrink-0 text-blue-500" size={18} />
          <p className="text-xs font-medium text-slate-600 leading-relaxed">
            <span className="font-bold text-blue-950">Tips Akurasi:</span>{" "}
            Jawablah setiap pernyataan secara jujur berdasarkan ketertarikan
            nyata Anda, bukan dorongan eksternal. Hal ini memastikan hasil
            rekomendasi yang lebih objektif.
          </p>
        </div>
      </div>
    </div>
  );
}
