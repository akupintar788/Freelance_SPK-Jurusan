import {
  AlertCircle,
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
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

// Helper: key localStorage per user
const getBakatKey = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return `survei_bakat_selesai_${user.id || "guest"}`;
  } catch {
    return "survei_bakat_selesai_guest";
  }
};

export default function SurveiBakat() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentStep, setCurrentStep] = useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(
    () => localStorage.getItem(getBakatKey()) === "1"
  );
  const [blockedByRapor, setBlockedByRapor] = useState(false);

  useEffect(() => {
    // Jika sudah selesai sebelumnya, tidak perlu load soal lagi
    if (localStorage.getItem(getBakatKey()) === "1") {
      setLoading(false);
      return;
    }
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError("");
      setBlockedByRapor(false);

      const bakatData = await fetchPertanyaanSurvei("bakat");
      setQuestions(
        Array.isArray(bakatData)
          ? bakatData.map((item) => ({ ...item, kategori: "Bakat" }))
          : []
      );
    } catch (err) {
      if (err.response?.status === 403) {
        setBlockedByRapor(true);
        await Swal.fire({
          icon: "warning",
          title: "Nilai Rapor Belum Diinput",
          text:
            err.response?.data?.message ||
            "Nilai rapor Anda belum diinput oleh Admin/Guru BK. Silakan lapor terlebih dahulu.",
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
      title: "Kirim Jawaban Bakat?",
      text: "Jawaban survei bakat akan disimpan. Setelah ini Anda bisa melanjutkan ke survei minat.",
      showCancelButton: true,
      confirmButtonColor: "#7c3aed",
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

      await submitSurvei({ tipe: "bakat", jawaban: formatJawaban });

      // Tandai bakat sudah selesai di localStorage
      localStorage.setItem(getBakatKey(), "1");
      setSuccess(true);

      await Swal.fire({
        icon: "success",
        title: "Survei Bakat Selesai!",
        text: "Jawaban bakat berhasil disimpan. Silakan lanjutkan ke survei minat.",
        confirmButtonColor: "#2563eb",
        confirmButtonText: "Lanjut ke Survei Minat",
      });

      navigate("/siswa/survei/minat");
    } catch (err) {
      console.error("Submit error:", err.response?.data);

      if (err.response?.status === 403) {
        await Swal.fire({
          icon: "warning",
          title: "Nilai Rapor Belum Diinput",
          text:
            err.response?.data?.message ||
            "Nilai rapor Anda belum diinput. Silakan lapor ke Admin/Guru BK.",
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
  const progress = questions.length > 0 ? ((currentStep + 1) / questions.length) * 100 : 0;
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
        <Loader2 className="animate-spin text-violet-600" size={42} />
        <p className="text-sm font-semibold text-slate-500 animate-pulse">
          Memuat pertanyaan survei bakat...
        </p>
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
        <div className="rounded-[32px] border border-violet-200 bg-gradient-to-b from-violet-50 to-violet-50/10 p-10 text-center shadow-lg">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-600/30">
            <CheckCircle2 size={38} />
          </div>
          <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900">
            Survei Bakat Selesai!
          </h2>
          <p className="mt-3 text-sm font-medium text-slate-600 leading-relaxed max-w-md mx-auto">
            Jawaban bakat Anda telah tersimpan. Lanjutkan ke survei minat untuk
            mendapatkan rekomendasi jurusan.
          </p>
          <button
            onClick={() => navigate("/siswa/survei/minat")}
            className="mt-8 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            Lanjut ke Survei Minat →
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
            Belum Ada Soal Survei Bakat
          </h2>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
            Admin/Guru BK belum meluncurkan butir pertanyaan bakat. Mohon tunggu
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
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600 font-extrabold text-sm">
            1
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-violet-500">
            Tahap 1 dari 2
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
          Survei Bakat
        </h1>
        <p className="mt-1.5 text-sm font-medium text-slate-500">
          Selesaikan survei bakat ini terlebih dahulu. Setelah selesai, Anda
          dapat melanjutkan ke survei minat.
        </p>
      </div>

      {/* ── Step info banner ── */}
      <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
          <Award size={18} />
        </div>
        <div>
          <p className="text-sm font-bold text-violet-900">Survei Bakat</p>
          <p className="text-xs text-violet-600">
            Selesaikan bagian ini untuk membuka akses Survei Minat.
          </p>
        </div>
        <div className="ml-auto rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm border border-violet-100">
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
            Kemajuan Bakat:{" "}
            <span
              className={
                answeredCount === questions.length
                  ? "text-emerald-600 font-extrabold"
                  : "text-violet-600"
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
                : "bg-gradient-to-r from-violet-500 to-indigo-600"
            }`}
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>

      {/* ── Question Card ── */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 md:p-10 shadow-xl relative overflow-hidden">
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 to-indigo-600" />

        {/* Card header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl font-extrabold text-sm bg-violet-50 text-violet-600">
              {currentStep + 1}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Survei Bakat — Soal {currentStep + 1} dari {questions.length}
              </p>
              <p className="text-sm font-semibold text-slate-600">
                Pilih jawaban yang paling mencerminkan diri Anda.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold tracking-wider uppercase bg-violet-50 text-violet-700">
            <HelpCircle size={13} />
            Bakat
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
                    ? "border-violet-600 bg-violet-50/40 text-violet-900 shadow-sm"
                    : "border-slate-100 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-white hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                      isSelected
                        ? "border-violet-600 bg-violet-600 text-white"
                        : "border-slate-300 bg-white group-hover:border-slate-400"
                    }`}
                  >
                    {isSelected && (
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-bold tracking-wide ${
                      isSelected ? "text-violet-900" : "text-slate-700"
                    }`}
                  >
                    {option.label}
                  </span>
                </div>
                <span
                  className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                    isSelected
                      ? "bg-violet-600 text-white"
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
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-violet-600/20 transition hover:bg-violet-700 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  Simpan & Lanjut ke Minat
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
              Peta Lembar Jawaban — Bakat
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Klik nomor di bawah untuk melompat ke soal terkait.
            </p>
          </div>
          {answeredCount < questions.length && (
            <button
              onClick={jumpToFirstUnanswered}
              className="text-left text-xs font-bold text-violet-600 transition hover:text-violet-800"
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
                    ? "bg-violet-600 text-white shadow-xs"
                    : isCurrent
                      ? "bg-violet-50 text-violet-600 ring-2 ring-violet-500"
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
      <div className="rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50/60 to-indigo-50/20 p-4">
        <div className="flex gap-3">
          <Sparkles className="shrink-0 text-violet-500" size={18} />
          <p className="text-xs font-medium text-slate-600 leading-relaxed">
            <span className="font-bold text-violet-900">Tips Akurasi:</span>{" "}
            Jawablah setiap pernyataan secara jujur berdasarkan kemampuan dan
            kecenderungan nyata Anda, bukan dorongan eksternal.
          </p>
        </div>
      </div>
    </div>
  );
}
