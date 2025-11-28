// src/pages/akun.js
import AdminLayout from "@/layouts/adminlayout";
import UserLayout from "@/layouts/userlayout";
import Cookies from "js-cookie";
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  addDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

/**
 * Halaman Akun (diperluas)
 * - Admin: lihat semua akun, ubah nama/role, reset password, hapus (tidak bisa hapus diri sendiri)
 * - User: lihat & edit profil sendiri
 *
 * NOTE: Jika sistem autentikasi benar-benar memakai Firebase Authentication terpisah,
 * jangan mengubah field 'password' di Firestore; gunakan mekanisme password reset dari Firebase Auth.
 */

function Toast({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="fixed right-6 top-6 z-50">
      <div className="bg-green-700 text-white px-4 py-2 rounded shadow">
        <div className="flex items-center gap-3">
          <div className="text-sm">{message}</div>
          <button onClick={onClose} className="text-white/80 hover:opacity-90">×</button>
        </div>
      </div>
    </div>
  );
}

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="text-gray-600" onClick={onClose}>✕</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center p-6">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-600" />
    </div>
  );
}

export default function Akun() {
  const cookie = Cookies.get("user");
  const parsedUser = cookie ? JSON.parse(cookie) : { role: "user" };
  const Layout = parsedUser.role === "admin" ? AdminLayout : UserLayout;

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [queryText, setQueryText] = useState("");
  const [sortBy, setSortBy] = useState("name"); // name or email or role
  const [sortDir, setSortDir] = useState("asc"); // asc / desc

  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});

  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: "" });
  const [resetModal, setResetModal] = useState({ open: false, id: null, name: "", newPassword: "" });
  const [createModal, setCreateModal] = useState({ open: false, name: "", email: "", password: "", role: "user" });

  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  useEffect(() => {
    loadAccounts();
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (msg, ttl = 3000) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), ttl);
  };

  // load accounts from Firestore
  const loadAccounts = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const col = collection(db, "users");
      const q = query(col, orderBy("name", "asc"));
      const snap = await getDocs(q);
      const users = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAccounts(users);
    } catch (err) {
      console.error("Error fetching users:", err);
      setFetchError("Gagal memuat akun. Cek koneksi atau rules Firestore.");
    } finally {
      setLoading(false);
    }
  };

  // Filtering + sorting (client-side)
  const visibleAccounts = accounts
    .filter((u) =>
      `${u.name} ${u.email} ${u.role || "user"}`.toLowerCase().includes(queryText.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = String(a[sortBy] || "").toLowerCase();
      const bVal = String(b[sortBy] || "").toLowerCase();
      if (aVal === bVal) return 0;
      if (sortDir === "asc") return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

  // Start editing
  const beginEdit = (user) => {
    setEditingId(user.id);
    setEditingData({ name: user.name || "", role: user.role || "user" });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditingData({});
  };

  // Save editing
  const saveEdit = async (id) => {
    const account = accounts.find((a) => a.id === id);
    if (!account) return showToast("Akun tidak ditemukan");
    if (!editingData.name || editingData.name.trim().length < 2) {
      return showToast("Nama minimal 2 karakter");
    }
    try {
      await updateDoc(doc(db, "users", id), {
        name: editingData.name.trim(),
        role: editingData.role || "user",
      });
      showToast("Perubahan tersimpan");
      setEditingId(null);
      setEditingData({});
      loadAccounts();
    } catch (err) {
      console.error("Save error", err);
      showToast("Gagal menyimpan perubahan");
    }
  };

  // Open confirm delete
  const askDelete = (u) => {
    setConfirmDelete({ open: true, id: u.id, name: u.name });
  };

  // Perform delete
  const performDelete = async () => {
    const { id } = confirmDelete;
    if (!id) {
      setConfirmDelete({ open: false, id: null, name: "" });
      return;
    }
    // prevent deleting self
    if (parsedUser.email && accounts.find((a) => a.id === id && a.email === parsedUser.email)) {
      showToast("Kamu tidak bisa menghapus akun sendiri");
      setConfirmDelete({ open: false, id: null, name: "" });
      return;
    }
    try {
      await deleteDoc(doc(db, "users", id));
      showToast("Akun dihapus");
      setConfirmDelete({ open: false, id: null, name: "" });
      loadAccounts();
    } catch (err) {
      console.error("Delete error", err);
      showToast("Gagal menghapus akun");
    }
  };

  // Open reset password modal
  const openReset = (u) => {
    setResetModal({ open: true, id: u.id, name: u.name, newPassword: "" });
  };

  // Perform reset password (writes to Firestore field 'password' — adapt if using Auth)
  const performResetPassword = async () => {
    const { id, newPassword } = resetModal;
    if (!newPassword || newPassword.length < 6) {
      showToast("Password minimal 6 karakter");
      return;
    }
    try {
      await updateDoc(doc(db, "users", id), {
        password: newPassword,
      });
      showToast("Password berhasil direset (ditulis ke Firestore)");
      setResetModal({ open: false, id: null, name: "", newPassword: "" });
      loadAccounts();
    } catch (err) {
      console.error("Reset password error", err);
      showToast("Gagal reset password");
    }
  };

  // Create new user
  const handleCreateUser = async () => {
    const { name, email, password, role } = createModal;
    if (!name || !email || !password) {
      return showToast("Lengkapi semua field!");
    }
    if (password.length < 6) {
      return showToast("Password minimal 6 karakter");
    }
    
    // Check if email already exists
    const emailExists = accounts.some(a => a.email === email);
    if (emailExists) {
      return showToast("Email sudah terdaftar");
    }

    try {
      await addDoc(collection(db, "users"), {
        name: name.trim(),
        email: email.trim(),
        password: password,
        role: role || "user",
        createdAt: serverTimestamp(),
      });
      showToast("User berhasil ditambahkan");
      setCreateModal({ open: false, name: "", email: "", password: "", role: "user" });
      loadAccounts();
    } catch (err) {
      console.error("Create user error", err);
      showToast("Gagal menambahkan user");
    }
  };

  // Export CSV
  const exportCSV = () => {
    if (!accounts.length) return showToast("Tidak ada data untuk diexport");
    const headers = ["id", "name", "email", "role", "createdAt"];
    const rows = accounts.map((a) => [
      a.id,
      `"${(a.name || "").replaceAll('"', '""')}"`,
      (a.email || ""),
      (a.role || "user"),
      a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000).toISOString() : "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `accounts_${new Date().toISOString().slice(0, 19)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Akun Pengguna 👤</h1>
            <p className="text-sm text-gray-600 mt-1">
              {parsedUser.role === "admin" ? "Kelola semua akun pengguna." : "Lihat dan ubah profilmu."}
            </p>
          </div>

          <div className="flex gap-2">
            {parsedUser.role === "admin" && (
              <button
                onClick={() => setCreateModal({ open: true, name: "", email: "", password: "", role: "user" })}
                className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                + Tambah User
              </button>
            )}
            <button
              onClick={loadAccounts}
              className="px-3 py-2 rounded border hover:bg-gray-50"
            >
              Refresh
            </button>
            {parsedUser.role === "admin" && (
              <button
                onClick={exportCSV}
                className="px-3 py-2 rounded bg-green-700 text-white hover:bg-green-800"
              >
                Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Controls: search + sort */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div className="flex gap-3 w-full md:w-2/3">
            <input
              placeholder="Cari nama / email / role..."
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              className="flex-1 p-3 border rounded"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-3 border rounded"
            >
              <option value="name">Nama</option>
              <option value="email">Email</option>
              <option value="role">Role</option>
            </select>
            <select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value)}
              className="p-3 border rounded"
            >
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
          </div>

          <div className="text-sm text-gray-500">
            {accounts.length} akun terdaftar
          </div>
        </div>

        {loading ? (
          <Spinner />
        ) : fetchError ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">{fetchError}</div>
        ) : visibleAccounts.length === 0 ? (
          <div className="p-4 bg-yellow-50 border rounded text-yellow-700">Tidak ada akun</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {visibleAccounts.map((user) => {
              const isEditing = editingId === user.id;
              const isSelf = parsedUser.email && parsedUser.email === user.email;
              const initials = (user.name || "U").split(" ").map(s => s[0]).slice(0,2).join("").toUpperCase();

              return (
                <div key={user.id} className="bg-white border rounded-lg p-4 shadow-sm flex flex-col">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-semibold">
                      {initials}
                    </div>
                    <div className="flex-1">
                      {isEditing ? (
                        <input
                          value={editingData.name}
                          onChange={(e) => setEditingData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full border-b pb-1 focus:outline-none"
                        />
                      ) : (
                        <div className="text-lg font-semibold">{user.name || "—"}</div>
                      )}
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                    <div className="text-sm text-gray-400">{user.role || "user"}</div>
                  </div>

                  <div className="mt-3 flex-1">
                    <div className="text-sm text-gray-600 whitespace-pre-line">
                      {/* placeholder area if you want to show more profile info */}
                      {user.bio ? user.bio : ""}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 items-center">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => saveEdit(user.id)}
                          className="px-3 py-1 bg-green-700 text-white rounded"
                        >
                          Simpan
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 border rounded"
                        >
                          Batal
                        </button>
                      </>
                    ) : (
                      <>
                        {/* allow edit if admin or owner */}
                        {(parsedUser.role === "admin" || isSelf) && (
                          <button
                            onClick={() => beginEdit(user)}
                            className="px-3 py-1 border rounded"
                          >
                            Edit
                          </button>
                        )}

                        {/* Admin actions */}
                        {parsedUser.role === "admin" && !isSelf && (
                          <>
                            <button
                              onClick={() => openReset(user)}
                              className="px-3 py-1 bg-yellow-400 rounded"
                            >
                              Reset Password
                            </button>
                            <button
                              onClick={() => askDelete(user)}
                              className="px-3 py-1 bg-red-500 text-white rounded"
                            >
                              Hapus
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Confirm Delete Modal */}
        <Modal
          open={confirmDelete.open}
          title="Konfirmasi Hapus Akun"
          onClose={() => setConfirmDelete({ open: false, id: null, name: "" })}
        >
          <p>Yakin ingin menghapus akun <strong>{confirmDelete.name}</strong> ?</p>
          <div className="mt-4 flex justify-end gap-2">
            <button className="px-3 py-1 border rounded" onClick={() => setConfirmDelete({ open: false, id: null, name: "" })}>Batal</button>
            <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={performDelete}>Hapus</button>
          </div>
        </Modal>

        {/* Reset Password Modal */}
        <Modal
          open={resetModal.open}
          title={`Reset Password — ${resetModal.name}`}
          onClose={() => setResetModal({ open: false, id: null, name: "", newPassword: "" })}
        >
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Isi password baru. (Catatan: action ini menulis field `password` ke dokumen Firestore.
              Jika kamu menggunakan Firebase Authentication, ganti dengan mekanisme reset dari Firebase Auth.)
            </p>
            <input
              type="password"
              placeholder="Password baru (min 6 karakter)"
              value={resetModal.newPassword}
              onChange={(e) => setResetModal(prev => ({ ...prev, newPassword: e.target.value }))}
              className="w-full p-2 border rounded"
            />
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1 border rounded" onClick={() => setResetModal({ open: false, id: null, name: "", newPassword: "" })}>Batal</button>
              <button className="px-3 py-1 bg-green-700 text-white rounded" onClick={performResetPassword}>Reset</button>
            </div>
          </div>
        </Modal>

        {/* Create User Modal */}
        <Modal
          open={createModal.open}
          title="Tambah User Baru"
          onClose={() => setCreateModal({ open: false, name: "", email: "", password: "", role: "user" })}
        >
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nama"
              value={createModal.name}
              onChange={(e) => setCreateModal(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 border rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={createModal.email}
              onChange={(e) => setCreateModal(prev => ({ ...prev, email: e.target.value }))}
              className="w-full p-2 border rounded"
            />
            <input
              type="password"
              placeholder="Password (min 6 karakter)"
              value={createModal.password}
              onChange={(e) => setCreateModal(prev => ({ ...prev, password: e.target.value }))}
              className="w-full p-2 border rounded"
            />
            <select
              value={createModal.role}
              onChange={(e) => setCreateModal(prev => ({ ...prev, role: e.target.value }))}
              className="w-full p-2 border rounded"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-3 py-1 border rounded"
                onClick={() => setCreateModal({ open: false, name: "", email: "", password: "", role: "user" })}
              >
                Batal
              </button>
              <button
                className="px-3 py-1 bg-green-700 text-white rounded"
                onClick={handleCreateUser}
              >
                Tambah
              </button>
            </div>
          </div>
        </Modal>

        <Toast message={toast} onClose={() => setToast("")} />
      </div>
    </Layout>
  );
}
