import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { db } from "@/lib/firebase";
import AdminLayout from "@/layouts/adminlayout";
import {
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  addDoc,
  doc,
} from "firebase/firestore";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(true);

  // 🔐 Cek login
  useEffect(() => {
    const cookieUser = Cookies.get("user");

    if (!cookieUser) {
      router.push("/login");
      return;
    }

    try {
      const parsed = JSON.parse(cookieUser);
      setUser(parsed);

      if (parsed.role === "user") {
        router.push("/dashboard-user");
      }
    } catch (err) {
      Cookies.remove("user");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!user || user.role !== "admin") return null;


  // 📂 Ambil data users
  const loadUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    setUsers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  // ➕ Tambah user baru
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password)
      return alert("Lengkapi semua field!");

    await addDoc(collection(db, "users"), {
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      createdAt: new Date(),
    });

    setNewUser({ name: "", email: "", password: "" });
    loadUsers();
  };

  // ✏️ Edit nama user
  const handleEdit = async (id) => {
    const newName = prompt("Masukkan nama baru:");
    if (!newName) return;
    await updateDoc(doc(db, "users", id), { name: newName });
    loadUsers();
  };

  // ❌ Hapus user
  const handleDelete = async (id) => {
    if (!confirm("Yakin mau hapus user ini?")) return;
    await deleteDoc(doc(db, "users", id));
    loadUsers();
  };

  // 🚪 Logout
  const handleLogout = async () => {
    await fetch("/api/logout");
    Cookies.remove("user");
    router.push("/login");
  };

  // 🔄 Loading state
  if (!user) return <p className="text-center mt-10">Loading...</p>;

  // ✅ Render layout admin
  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* Form Create User */}
        <form onSubmit={handleCreate} className="mb-6 flex gap-3">
          <input
            type="text"
            placeholder="Nama"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            className="border p-2 rounded w-40"
          />
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className="border p-2 rounded w-56"
          />
          <input
            type="password"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            className="border p-2 rounded w-40"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 rounded hover:bg-green-700"
          >
            Tambah User
          </button>
        </form>

        {/* Table Users */}
        <table className="border w-full text-left">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="p-2">Nama</th>
              <th className="p-2">Email</th>
              <th className="p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
                <div class="leaf-container">
                    <div class="leaf leaf-type-1 leaf-1"></div>
                    <div class="leaf leaf-type-2 leaf-2"></div>
                    <div class="leaf leaf-type-3 leaf-3"></div>
                    <div class="leaf leaf-type-4 leaf-4"></div>
                    <div class="leaf leaf-type-5 leaf-5"></div>
                    <div class="leaf leaf-type-1 leaf-6"></div>
                    <div class="leaf leaf-type-2 leaf-7"></div>
                    <div class="leaf leaf-type-3 leaf-8"></div>
                    <div class="leaf leaf-type-4 leaf-9"></div>
                    <div class="leaf leaf-type-5 leaf-10"></div>
                </div>
            {users.map((u) => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2 flex gap-2">
                  <button
                    onClick={() => handleEdit(u.id)}
                    className="bg-yellow-400 px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
