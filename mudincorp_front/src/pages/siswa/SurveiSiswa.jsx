import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  fetchPertanyaanSurvei,
  submitSurvei,
} from "../../services/siswaSurveiService.js";
const loadQuestions = async () => {
    try {
      setLoading(true);
      setError("");

      // Mengambil data bakat dan minat secara serentak
      const [bakatData, minatData] = await Promise.all([
        fetchPertanyaanSurvei("bakat"),
        fetchPertanyaanSurvei("minat"),
      ]);

      // Mengamankan data jika seandainya response kosong/bukan array
      const dataBakatSafe = Array.isArray(bakatData) ? bakatData : [];
      const dataMinatSafe = Array.isArray(minatData) ? minatData : [];

      const merged = [
        ...dataBakatSafe.map((item) => ({
          ...item,
          kategori: "Bakat",
        })),
        ...dataMinatSafe.map((item) => ({
          ...item,
          kategori: "Minat",
        })),
      ];

      setQuestions(merged);
    } catch (err) {
      console.error("Error load questions:", err);
      setError("Gagal memuat soal survei. Pastikan tabel pertanyaan_survei sudah ada isinya.");
    } finally {
      setLoading(false);
    }
  };
export default function SurveiSiswa() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);

  const optionValues = [
    {
      label: "Sangat Sesuai",
      value: 5,
    },
    {
      label: "Sesuai",
      value: 4,
    },
    {
      label: "Cukup Sesuai",
      value: 3,
    },
    {
      label: "Kurang Sesuai",
      value: 2,
    },
    {
      label: "Tidak Sesuai",
      value: 1,
    },
  ];

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError("");

      // ambil bakat + minat
      const [bakatData, minatData] = await Promise.all([
        fetchPertanyaanSurvei("bakat"),
        fetchPertanyaanSurvei("minat"),
      ]);

      const merged = [
        ...(Array.isArray(bakatData)
          ? bakatData.map((item) => ({
              ...item,
              kategori: "Bakat",
            }))
          : []),

        ...(Array.isArray(minatData)
          ? minatData.map((item) => ({
              ...item,
              kategori: "Minat",
            }))
          : []),
      ];

      setQuestions(merged);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat soal survei.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));

    if (currentStep < questions.length - 1) {
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 250);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    // 1. Ubah state jawaban di React menjadi format array object yang sesuai backend
    // Ganti 'answers' dengan nama state penyimpanan jawaban kamu di React
    const formatJawaban = Object.keys(answers).map((id) => ({
      pertanyaan_id: parseInt(id), // FIX: pastikan namanya 'pertanyaan_id' dan tipenya Integer
      skor: parseInt(answers[id]),  // FIX: pastikan namanya 'skor' dan tipenya Integer (1-5)
    }));

    // 2. BUNGKUS array tersebut ke dalam object dengan key 'jawaban'
    const payload = {
      jawaban: formatJawaban
    };

    console.log("Data yang dikirim ke backend:", payload); // Untuk debug di console log

    // 3. Kirim payload yang sudah dibungkus ke service
    const response = await submitSurvei(payload);
    
    alert("Survei berhasil disimpan!");
    
    // Sembari survei disimpan, backend otomatis menghitung SAW lewat SawService
    // Arahkan siswa ke halaman hasil rekomendasi
    // navigate('/siswa/hasil-rekomendasi');

  } catch (err) {
    console.error("Error 422 detail:", err.response?.data);
    
    // Menampilkan pesan error validasi spesifik dari Laravel jika ada
    if (err.response && err.response.status === 422) {
      const errorMessages = JSON.stringify(err.response.data);
      alert(`Gagal validasi: ${errorMessages}`);
    } else {
      alert("Terjadi kesalahan saat menyimpan survei.");
    }
  }
};

  const progress =
    questions.length > 0
      ? ((currentStep + 1) / questions.length) * 100
      : 0;

  const currentQuestion = questions[currentStep];

  const categoryProgress = useMemo(() => {
    return questions.reduce((acc, item) => {
      const key = item.kategori;

      if (!acc[key]) {
        acc[key] = {
          total: 0,
          answered: 0,
        };
      }

      acc[key].total += 1;

      if (answers[item.id]) {
        acc[key].answered += 1;
      }

      return acc;
    }, {});
  }, [questions, answers]);

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="animate-spin text-sky-500" size={42} />
      </div>
    );
  }

  // =========================
  // SUCCESS
  // =========================
  if (success) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-12 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white">
            <CheckCircle2 size={42} />
          </div>

          <h2 className="mt-6 text-2xl font-bold text-emerald-900">
            Survei Berhasil Dikirim
          </h2>

          <p className="mt-3 text-emerald-700">
            Jawaban berhasil disimpan dan sedang diproses.
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // EMPTY
  // =========================
  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-12 text-center">
          <AlertCircle
            size={48}
            className="mx-auto text-amber-500"
          />

          <h2 className="mt-5 text-2xl font-bold text-amber-900">
            Belum Ada Soal Survei
          </h2>

          <p className="mt-2 text-amber-700">
            Admin belum menambahkan soal survei.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* HEADER */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">
          Survei Minat & Bakat
        </h1>

        <p className="mt-2 text-slate-500">
          Isi seluruh pertanyaan agar sistem dapat
          memberikan rekomendasi jurusan terbaik.
        </p>
      </div>

      {/* PROGRESS CATEGORY */}
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(categoryProgress).map(
          ([category, item]) => (
            <div
              key={category}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>{category}</span>

                <span>
                  {item.answered}/{item.total}
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full transition-all duration-500 ${
                    category === "Bakat"
                      ? "bg-violet-500"
                      : "bg-sky-500"
                  }`}
                  style={{
                    width: `${
                      (item.answered / item.total) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          )
        )}
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex gap-3">
            <AlertCircle
              size={20}
              className="text-red-500"
            />

            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* GLOBAL PROGRESS */}
      <div>
        <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-600">
          <span>Progress</span>

          <span>{Math.round(progress)}%</span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-sky-500 transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      {/* QUESTION CARD */}
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 font-bold text-sky-600">
            {currentStep + 1}
          </div>

          <div className="text-sm font-semibold uppercase tracking-widest text-slate-400">
            Pertanyaan {currentStep + 1} /{" "}
            {questions.length}
          </div>
        </div>

        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          Kategori: {currentQuestion.kategori}
        </p>

        <h2 className="text-2xl font-bold leading-snug text-slate-900">
          {currentQuestion.pertanyaan}
        </h2>

        {currentQuestion.jurusan && (
          <div className="mt-4 inline-flex rounded-xl bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700">
            Jurusan:{" "}
            {currentQuestion.jurusan.nama_jurusan}
          </div>
        )}

        {/* OPTIONS */}
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {optionValues.map((option) => (
            <button
              key={option.value}
              onClick={() =>
                handleSelect(
                  currentQuestion.id,
                  option.value
                )
              }
              className={`rounded-2xl border-2 p-5 text-left transition-all hover:scale-[1.02] ${
                answers[currentQuestion.id] ===
                option.value
                  ? "border-sky-500 bg-sky-50"
                  : "border-slate-100 bg-slate-50 hover:border-sky-200 hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">
                  {option.label}
                </span>

                {answers[currentQuestion.id] ===
                  option.value && (
                  <div className="rounded-full bg-sky-500 p-1 text-white">
                    <ChevronRight size={16} />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* NAVIGATION */}
        <div className="mt-12 flex items-center justify-between border-t border-slate-100 pt-6">
          <button
            disabled={currentStep === 0}
            onClick={() =>
              setCurrentStep((prev) => prev - 1)
            }
            className="flex items-center gap-2 text-slate-500 transition hover:text-slate-900 disabled:opacity-30"
          >
            <ChevronLeft size={20} />
            Sebelumnya
          </button>

          {currentStep === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-3 font-bold text-white shadow-lg transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />
                  Mengirim...
                </>
              ) : (
                <>
                  Kirim Jawaban
                  <Send size={20} />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() =>
                setCurrentStep((prev) => prev + 1)
              }
              className="flex items-center gap-2 text-slate-500 transition hover:text-slate-900"
            >
              Selanjutnya
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>

      {/* SUMMARY */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 font-bold text-slate-900">
          Ringkasan Jawaban
        </h3>

        <div className="flex flex-wrap gap-2">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentStep(idx)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition ${
                answers[q.id]
                  ? "bg-sky-500 text-white"
                  : currentStep === idx
                  ? "bg-sky-100 text-sky-700"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* TIPS */}
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex gap-3">
          <Sparkles className="text-amber-500" />

          <p className="text-sm font-medium text-amber-800">
            Jawablah sesuai kondisi dan minat diri
            sendiri agar rekomendasi jurusan lebih
            akurat.
          </p>
        </div>
      </div>
    </div>
  );
}