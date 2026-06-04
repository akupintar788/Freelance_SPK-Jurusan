import { useEffect, useMemo, useState } from "react";
import {
  createUser,
  deleteUser,
  fetchUsers,
} from "../../services/userService.js";

const roleLabels = {
  admin: "Administrator",
  guru_bk: "Guru BK",
  siswa: "Siswa",
};

export default function KelolaUser() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    nip: "",
    role: "siswa", // Default otomatis disetel sebagai siswa
    password: "",
    kelas: "",
    jurusan: "",
  });

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [formError, setFormError] = useState("");
  const [formMessage, setFormMessage] = useState("");

  useEffect(() => {
    // Pastikan jika yang login Guru BK, role dipaksa hanya siswa
    if (currentUser?.role === "guru_bk") {
      setForm((prev) => ({ ...prev, role: "siswa" }));
    }
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Gagal memuat user.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleAddUser(e) {
    e.preventDefault();

    setFormError("");
    setFormMessage("");

    if (!form.name || !form.nip || !form.password) {
      setFormError("Semua field wajib diisi.");
      return;
    }

    if (form.password.length < 8) {
      setFormError("Password minimal 8 karakter.");
      return;
    }

    if (form.role === "siswa") {
      if (!form.kelas) {
        setFormError("Kelas wajib dipilih.");
        return;
      }

      if (!form.jurusan) {
        setFormError("Jurusan wajib dipilih.");
        return;
      }
    }

    try {
      const payload = {
        name: form.name.trim(),
        nip: form.nip.trim(),
        password: form.password,
        role: form.role,
      };

      // Hanya kirim kelas & jurusan jika siswa
      if (form.role === "siswa") {
        payload.kelas = form.kelas;
        payload.jurusan = form.jurusan;
      }

      console.log("PAYLOAD => ", payload);

      await createUser(payload);

      setFormMessage("User berhasil ditambahkan.");

      // Reset form kembali ke default (Siswa)
      setForm({
        name: "",
        nip: "",
        role: "siswa", 
        password: "",
        kelas: "",
        jurusan: "",
      });

      loadUsers();
    } catch (err) {
      console.log(err.response?.data);

      const errors = err.response?.data;

      if (typeof errors === "object") {
        setFormError(Object.values(errors).flat().join(" "));
      } else {
        setFormError("Gagal menambahkan user.");
      }
    }
  }

  async function handleDelete(id) {
    const confirmDelete = window.confirm("Yakin ingin menghapus user ini?");

    if (!confirmDelete) return;

    try {
      await deleteUser(id);
      setActionMessage("User berhasil dihapus.");
      loadUsers();
    } catch (err) {
      setError("Gagal menghapus user.");
    }
  }

  const visibleUsers = Array.isArray(users)
    ? users.filter((u) => u.role !== "admin")
    : [];

  const filteredUsers = useMemo(() => {
    const q = query.toLowerCase();

    return visibleUsers.filter((user) =>
      [user.name, user.nip, user.role]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [query, visibleUsers]);

  const guruCount = visibleUsers.filter((u) => u.role === "guru_bk").length;
  const siswaCount = visibleUsers.filter((u) => u.role === "siswa").length;

  return (
    <section className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Kelola User</h1>
              <p className="mt-1 text-sm text-slate-500">
                Kelola akun Guru BK dan Siswa
              </p>
            </div>

            <button
              onClick={loadUsers}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Refresh
            </button>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleAddUser}
            className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5"
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Nama
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nama lengkap"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  NIP / NISN
                </label>
                <input
                  type="text"
                  name="nip"
                  value={form.nip}
                  onChange={handleChange}
                  placeholder="Nomor induk"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Role
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900"
                >
                  {/* ADMIN bisa buat semua */}
                  {currentUser?.role === "admin" && (
                    <option value="guru_bk">Guru BK</option>
                  )}

                  {/* Guru BK cuma bisa buat siswa, Admin juga bisa */}
                  <option value="siswa">Siswa</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimal 8 karakter"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-900"
                />
              </div>
            </div>

            {/* KELAS & JURUSAN HANYA MUNCUL JIKA ROLE === SISWA */}
            {form.role === "siswa" && (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Kelas
                  </label>
                  <select
                    name="kelas"
                    value={form.kelas}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-900"
                  >
                    <option value="">Pilih Kelas</option>
                    <option value="XII 1">XII 1</option>
                    <option value="XII 2">XII 2</option>
                    <option value="XII 3">XII 3</option>
                    <option value="XII 4">XII 4</option>
                    <option value="XII 5">XII 5</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Jurusan
                  </label>
                  <select
                    name="jurusan"
                    value={form.jurusan}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-900"
                  >
                    <option value="">Pilih Jurusan</option>
                    <option value="IPA">IPA</option>
                    <option value="IPS">IPS</option>
                  </select>
                </div>
              </div>
            )}

            {/* ALERT */}
            {(formError || formMessage) && (
              <div className="mt-4 space-y-2">
                {formError && (
                  <div className="rounded-2xl bg-rose-100 px-4 py-3 text-sm text-rose-700">
                    {formError}
                  </div>
                )}
                {formMessage && (
                  <div className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm text-emerald-700">
                    {formMessage}
                  </div>
                )}
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Tambah User
              </button>
            </div>
          </form>

          {/* STATS */}
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Total User</p>
              <h2 className="mt-3 text-3xl font-bold text-black">{visibleUsers.length}</h2>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Guru BK</p>
              <h2 className="mt-3 text-3xl font-bold text-black">{guruCount}</h2>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Siswa</p>
              <h2 className="mt-3 text-3xl font-bold text-black">{siswaCount}</h2>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Daftar User</h2>
              <p className="text-sm text-slate-500">
                Data seluruh pengguna sistem
              </p>
            </div>

            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari..."
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-900"
            />
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-4 py-4 text-left">Nama</th>
                  <th className="px-4 py-4 text-left">NIP/NISN</th>
                  <th className="px-4 py-4 text-left">Role</th>
                  <th className="px-4 py-4 text-left">Dibuat</th>
                  <th className="px-4 py-4 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center">
                      Memuat...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 font-semibold">{user.name}</td>
                      <td className="px-4 py-4">{user.nip}</td>
                      <td className="px-4 py-4">{roleLabels[user.role]}</td>
                      <td className="px-4 py-4">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString(
                              "id-ID",
                            )
                          : "-"}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="rounded-xl bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-200"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}