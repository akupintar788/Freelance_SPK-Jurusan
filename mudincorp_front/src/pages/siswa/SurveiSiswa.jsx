import {
  AlertCircle,
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  HelpCircle,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  fetchPertanyaanSurvei,
  submitSurvei,
} from "../../services/siswaSurveiService.js";

const SECTION_META = {
  bakat: {
    label: "Bakat",
    title: "Survei Bakat",
    description:
      "Isi bagian bakat terlebih dahulu untuk memulai penilaian kemampuan dan kecenderungan diri.",
    accent: "violet",
  },
  minat: {
    label: "Minat",
    title: "Survei Minat",
    description:
      "Setelah bagian bakat selesai, lanjutkan pengisian bagian minat untuk menghasilkan rekomendasi jurusan.",
    accent: "blue",
  },
};

export default function SurveiSiswa() {
  const navigate = useNavigate();

  const [bakatQuestions, setBakatQuestions] = useState([]);
  const [minatQuestions, setMinatQuestions] = useState([]);
  const [answersByType, setAnswersByType] = useState({ bakat: {}, minat: {} });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);
  const [currentSurveyType, setCurrentSurveyType] = useState("bakat");
  const [completedSections, setCompletedSections] = useState({
    bakat: false,
    minat: false,
  });
  const [sectionSuccess, setSectionSuccess] = useState("");

  const [blockedByRapor, setBlockedByRapor] = useState(false);

  const optionValues = [
    { label: "Sangat Sesuai", value: 5 },
    { label: "Sesuai", value: 4 },
    { label: "Cukup Sesuai", value: 3 },
    { label: "Kurang Sesuai", value: 2 },
    { label: "Tidak Sesuai", value: 1 },
  ];

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError("");
      setBlockedByRapor(false);

      const [bakatData, minatData] = await Promise.all([
        fetchPertanyaanSurvei("bakat"),
        fetchPertanyaanSurvei("minat"),
      ]);

      setBakatQuestions(
        Array.isArray(bakatData)
          ? bakatData.map((item) => ({ ...item, kategori: "Bakat" }))
          : [],
      );
      setMinatQuestions(
        Array.isArray(minatData)
          ? minatData.map((item) => ({ ...item, kategori: "Minat" }))
          : [],
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

      await Swal.fire({
        icon: "error",
        title: "Gagal Memuat Survei",
        text: pesanError,
      });
    } finally {
      setLoading(false);
    }
  };

  const questions =
    currentSurveyType === "bakat" ? bakatQuestions : minatQuestions;

  const handleSelect = (questionId, value) => {
    setAnswersByType((prev) => ({
      ...prev,
      [currentSurveyType]: {
        ...prev[currentSurveyType],
        [questionId]: value,
      },
    }));

    if (currentStep < questions.length - 1) {
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 250);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentAnswers = answersByType[currentSurveyType] || {};
    const unansweredCount = questions.filter(
      (q) => !currentAnswers[q.id],
    ).length;

    if (unansweredCount > 0) {
      await Swal.fire({
        icon: "warning",
        title: "Jawaban Belum Lengkap",
        text: `Masih ada ${unansweredCount} pertanyaan yang belum dijawab pada bagian ${SECTION_META[currentSurveyType].title}. Silakan lengkapi terlebih dahulu.`,
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    const konfirmasi = await Swal.fire({
      icon: "question",
      title: "Kirim Jawaban?",
      text: "Jawaban bagian ini akan disimpan. Setelah bagian bakat dan minat selesai, hasil rekomendasi baru bisa ditampilkan.",
      showCancelButton: true,
      confirmButtonColor: "#059669",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Kirim",
      cancelButtonText: "Periksa Lagi",
    });

    if (!konfirmasi.isConfirmed) return;

    setSubmitting(true);

    try {
      const formatJawaban = Object.keys(currentAnswers).map((id) => ({
        pertanyaan_id: parseInt(id),
        skor: parseInt(currentAnswers[id]),
      }));

      const payload = { tipe: currentSurveyType, jawaban: formatJawaban };
      await submitSurvei(payload);

      setCompletedSections((prev) => ({ ...prev, [currentSurveyType]: true }));

      if (currentSurveyType === "bakat") {
        setCurrentSurveyType("minat");
        setCurrentStep(0);
        setSectionSuccess(
          "Bagian bakat selesai. Silakan lanjutkan pengisian bagian minat.",
        );

        await Swal.fire({
          icon: "success",
          title: "Bagian Bakat Selesai",
          text: "Jawaban bakat berhasil disimpan. Silakan lanjutkan survei minat.",
          confirmButtonColor: "#2563eb",
        });
        return;
      }

      setSuccess(true);

      await Swal.fire({
        icon: "success",
        title: "Survei Selesai",
        text: "Kedua bagian survei telah selesai. Hasil rekomendasi jurusan siap dilihat.",
        confirmButtonColor: "#059669",
        confirmButtonText: "Lihat Hasil",
      });

      navigate("/siswa/hasil");
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

  const progress =
    questions.length > 0 ? ((currentStep + 1) / questions.length) * 100 : 0;

  const answeredCount =
    Object.keys(answersByType.bakat).length +
    Object.keys(answersByType.minat).length;
  const totalQuestions = bakatQuestions.length + minatQuestions.length;
  const totalProgress =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const currentQuestion = questions[currentStep];

  const categoryProgress = useMemo(() => {
    return [
      {
        key: "bakat",
        label: "Bakat",
        total: bakatQuestions.length,
        answered: Object.keys(answersByType.bakat).length,
        icon: Award,
        colorClass: "from-violet-500 to-indigo-600",
        badgeClass: "bg-violet-50 text-violet-700",
      },
      {
        key: "minat",
        label: "Minat",
        total: minatQuestions.length,
        answered: Object.keys(answersByType.minat).length,
        icon: Compass,
        colorClass: "from-blue-500 to-sky-600",
        badgeClass: "bg-blue-50 text-blue-700",
      },
    ];
  }, [bakatQuestions.length, minatQuestions.length, answersByType]);

  const canAccessMinat = completedSections.bakat;

  const handleSwitchSection = (section) => {
    if (section === "minat" && !canAccessMinat) {
      Swal.fire({
        icon: "warning",
        title: "Selesaikan Survei Bakat Terlebih Dahulu",
        text: "Anda wajib menyelesaikan bagian bakat sebelum membuka halaman minat.",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    setCurrentSurveyType(section);
    setCurrentStep(0);
    setError("");
  };

  const jumpToFirstUnanswered = () => {
    const idx = questions.findIndex(
      (q) => !answersByType[currentSurveyType][q.id],
    );
    if (idx !== -1) setCurrentStep(idx);
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] pt-24 flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={42} />
        <p className="text-sm font-semibold text-slate-500 animate-pulse">
          Memuat pertanyaan survei secara aman...
        </p>
      </div>
    );
  }

  if (blockedByRapor) {
    return (
      <div className="mx-auto max-w-2xl pt-24 px-4">
        <div className="rounded-[32px] border border-amber-200 bg-gradient-to-b from-amber-50 to-orange-50/20 p-10 text-center shadow-lg">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 shadow-inner">
            <AlertCircle size={38} />
          </div>
          <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900">
            Nilai Rapor Belum Diinput
          </h2>
          <p className="mt-3 text-sm font-medium text-slate-600 leading-relaxed max-w-md mx-auto">
            Untuk memulai pengisian survei, nilai rapor Anda wajib diinput
            terlebih dahulu oleh Admin atau Guru BK Anda. Silakan hubungi mereka
            untuk konfirmasi berkas.
          </p>
          <button
            onClick={() => navigate("/siswa")}
            className="mt-8 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-amber-500/20 transition hover:bg-amber-600"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-2xl pt-24 px-4">
        <div className="rounded-[32px] border border-emerald-200 bg-gradient-to-b from-emerald-50 to-emerald-50/10 p-10 text-center shadow-lg">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
            <CheckCircle2 size={38} />
          </div>
          <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900">
            Survei Selesai
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

  if (bakatQuestions.length === 0 && minatQuestions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl pt-24 px-4">
        <div className="rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <AlertCircle size={44} className="mx-auto text-slate-400" />
          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Belum Ada Soal Survei
          </h2>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
            Pihak Admin/Guru BK belum meluncurkan butir pertanyaan survei. Mohon
            tunggu informasi selanjutnya.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 pb-10 pt-24 fade-in">
      <div className="text-center md:text-left border-b border-slate-200 pb-5">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
          Survei Minat & Bakat Siswa
        </h1>
        <p className="mt-1.5 text-sm font-medium text-slate-500">
          Isi survei bakat dan minat secara terpisah. Hasil rekomendasi baru
          akan muncul setelah kedua bagian selesai.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900">
              Tahap {currentSurveyType === "bakat" ? "1" : "2"}:{" "}
              {SECTION_META[currentSurveyType].title}
            </p>
            <p className="text-xs text-slate-500">
              {currentSurveyType === "bakat"
                ? "Selesaikan survei bakat terlebih dahulu sebelum membuka halaman minat."
                : "Tahap bakat sudah selesai. Anda dapat melanjutkan ke survei minat."}
            </p>
          </div>
          <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
            {canAccessMinat ? "Minat siap dibuka" : "Minat belum dibuka"}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {categoryProgress.map((item) => {
          const Icon = item.icon;
          const isActive = currentSurveyType === item.key;
          const isCompleted = completedSections[item.key];
          const isLocked = item.key === "minat" && !canAccessMinat;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleSwitchSection(item.key)}
              disabled={isLocked}
              className={`rounded-2xl border p-5 text-left shadow-sm transition-all ${isActive ? "border-blue-300 bg-blue-50/40" : "border-slate-200/80 bg-white"} ${isLocked ? "cursor-not-allowed opacity-60" : "hover:-translate-y-0.5"}`}
            >
              <div className="flex items-center justify-between text-sm font-bold text-slate-800">
                <div className="flex items-center gap-2">
                  <div
                    className={`rounded-lg bg-gradient-to-r p-1.5 text-white ${item.colorClass}`}
                  >
                    <Icon size={16} />
                  </div>
                  <span>Survei {item.label}</span>
                </div>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs ${isCompleted ? "bg-emerald-50 text-emerald-700" : item.badgeClass}`}
                >
                  {item.answered} / {item.total} Soal {isCompleted ? "✓" : ""}
                </span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${item.colorClass}`}
                  style={{
                    width: `${item.total > 0 ? (item.answered / item.total) * 100 : 0}%`,
                  }}
                />
              </div>
              {isLocked && (
                <p className="mt-3 text-xs font-semibold text-amber-600">
                  Selesaikan bakat dulu untuk membuka halaman ini.
                </p>
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50/70 p-4">
          <div className="flex gap-3">
            <AlertCircle size={20} className="shrink-0 text-red-500" />
            <p className="text-sm font-semibold text-red-800">{error}</p>
          </div>
        </div>
      )}

      {sectionSuccess && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
          <div className="flex gap-3">
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
            <p className="text-sm font-semibold text-emerald-800">
              {sectionSuccess}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
          <span>
            Kemajuan Pengisian:{" "}
            <span
              className={
                answeredCount === totalQuestions
                  ? "text-emerald-600 font-extrabold"
                  : "text-blue-600"
              }
            >
              {answeredCount} dari {totalQuestions} Terjawab
            </span>
          </span>
          <span className="font-extrabold text-slate-700">
            {Math.round(totalProgress)}%
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${totalProgress === 100 ? "bg-emerald-500" : "bg-blue-600"}`}
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 md:p-10 shadow-xl relative overflow-hidden">
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${currentSurveyType === "bakat" ? "bg-violet-500" : "bg-blue-600"}`}
        />

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl font-extrabold text-sm ${currentSurveyType === "bakat" ? "bg-violet-50 text-violet-600" : "bg-blue-50 text-blue-600"}`}
            >
              {currentStep + 1}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                {SECTION_META[currentSurveyType].title}
              </p>
              <p className="text-sm font-semibold text-slate-600">
                {SECTION_META[currentSurveyType].description}
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold tracking-wider uppercase ${currentSurveyType === "bakat" ? "bg-violet-50 text-violet-700" : "bg-blue-50 text-blue-700"}`}
          >
            <HelpCircle size={13} />
            {SECTION_META[currentSurveyType].label}
          </span>
        </div>

        <h2 className="text-xl md:text-2xl font-extrabold leading-snug text-slate-900 tracking-tight mb-4">
          {currentQuestion?.pertanyaan ||
            "Tidak ada pertanyaan pada bagian ini."}
        </h2>

        {questions.length > 0 && (
          <div className="mt-8 grid gap-3.5 sm:grid-cols-1">
            {optionValues.map((option) => {
              const isSelected =
                answersByType[currentSurveyType][currentQuestion.id] ===
                option.value;
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
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white group-hover:border-slate-400"}`}
                    >
                      {isSelected && (
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-bold tracking-wide ${isSelected ? "text-blue-900" : "text-slate-700"}`}
                    >
                      {option.label}
                    </span>
                  </div>

                  <span
                    className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${isSelected ? "bg-blue-600 text-white" : "bg-slate-200/60 text-slate-500 group-hover:bg-slate-200"}`}
                  >
                    Skor {option.value}
                  </span>
                </button>
              );
            })}
          </div>
        )}

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
                  Simpan {SECTION_META[currentSurveyType].label}
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

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Peta Lembar Jawaban
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Klik nomor di bawah untuk melompat kembali ke soal terkait.
            </p>
          </div>
          {questions.length > 0 && answeredCount < totalQuestions && (
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
            const hasAnswer = !!answersByType[currentSurveyType][q.id];
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

        {questions.length > 0 && answeredCount < totalQuestions && (
          <p className="mt-3 inline-block rounded-lg bg-amber-50/60 px-3 py-1.5 text-[11px] font-semibold text-amber-600">
            ⚠️ Perhatian: Masih tersisa {totalQuestions - answeredCount} soal
            belum diselesaikan.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/60 to-sky-50/20 p-4.5">
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
