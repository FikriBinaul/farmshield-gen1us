import AdminLayout from "@/layouts/adminlayout";
import UserLayout from "@/layouts/userlayout";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

// 🔧 Reusable Modal
function Modal({ open, onClose, onSubmit, title, data, setData }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-[450px] animate-fadeIn">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>

        <input
          type="text"
          placeholder="Judul artikel"
          value={data.title}
          onChange={(e) => setData({ ...data, title: e.target.value })}
          className="w-full border p-2 rounded mb-3"
        />

        <textarea
          placeholder="Konten artikel"
          value={data.content}
          onChange={(e) => setData({ ...data, content: e.target.value })}
          className="w-full border p-2 rounded h-36 resize-none"
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Batal
          </button>

          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Ensiklopedia() {
  const cookie = Cookies.get("user");
  const parsed = cookie ? JSON.parse(cookie) : { role: "user" };
  const Layout = parsed.role === "admin" ? AdminLayout : UserLayout;

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editID, setEditID] = useState(null);

  const [form, setForm] = useState({ title: "", content: "" });

  // 🔥 Load & listen articles
  const loadArticles = async () => {
    setLoading(true);

    const q = query(collection(db, "ensiklopedia"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    setArticles(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    loadArticles();
  }, []);

  // ➕ Submit create or update
  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      alert("Judul dan isi wajib diisi!");
      return;
    }

    if (editID) {
      await updateDoc(doc(db, "ensiklopedia", editID), {
        title: form.title,
        content: form.content,
      });
    } else {
      await addDoc(collection(db, "ensiklopedia"), {
        ...form,
        createdAt: serverTimestamp(),
      });
    }

    setForm({ title: "", content: "" });
    setEditID(null);
    setModalOpen(false);
    loadArticles();
  };

  // 🗑 Delete
  const handleDelete = async (id) => {
    if (!confirm("Hapus artikel ini?")) return;
    await deleteDoc(doc(db, "ensiklopedia", id));
    loadArticles();
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-4">Ensiklopedia Pertanian 📚</h1>

      {/* Modal Form */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={editID ? "Edit Artikel" : "Tambah Artikel"}
        data={form}
        setData={setForm}
      />

      {parsed.role === "admin" && (
        <button
          onClick={() => {
            setForm({ title: "", content: "" });
            setEditID(null);
            setModalOpen(true);
          }}
          className="mb-5 bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
        >
          + Tambah Artikel
        </button>
      )}

      {/* Loading */}
      {loading && <p className="text-gray-500">Memuat data...</p>}

      {/* Artikel List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {articles.map((item) => (
          <div
            key={item.id}
            className="bg-white border rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="font-semibold text-xl mb-2">{item.title}</h2>
            <p className="whitespace-pre-line text-gray-700">{item.content}</p>

            {parsed.role === "admin" && (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setForm({ title: item.title, content: item.content });
                    setEditID(item.id);
                    setModalOpen(true);
                  }}
                  className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Hapus
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </Layout>
  );
}
