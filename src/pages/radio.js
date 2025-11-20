// src/pages/podcast.js
import AdminLayout from "@/layouts/adminlayout";
import UserLayout from "@/layouts/userlayout";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

export default function Podcast() {
  const cookie = Cookies.get("user");
  const parsed = cookie ? JSON.parse(cookie) : { role: "user" };
  const Layout = parsed.role === "admin" ? AdminLayout : UserLayout;

  const [podcasts, setPodcasts] = useState([]);
  const [form, setForm] = useState({ title: "", url: "" });
  const [openModal, setOpenModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");

  // Listener realtime
  useEffect(() => {
    const ref = collection(db, "podcasts");
    const qRef = query(ref, orderBy("createdAt", "desc"));
    
    const unsub = onSnapshot(qRef, (snapshot) => {
      setPodcasts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, []);

  // Buka modal untuk create
  const openCreateModal = () => {
    setForm({ title: "", url: "" });
    setEditId(null);
    setOpenModal(true);
  };

  // Buka modal untuk edit
  const openEditModal = (p) => {
    setForm({ title: p.title, url: p.url });
    setEditId(p.id);
    setOpenModal(true);
  };

  // Create or update
  const handleSubmit = async () => {
    if (!form.title || !form.url) return alert("Isi semua field!");

    if (editId) {
      await updateDoc(doc(db, "podcasts", editId), {
        title: form.title,
        url: form.url,
      });
    } else {
      await addDoc(collection(db, "podcasts"), {
        title: form.title,
        url: form.url,
        createdAt: serverTimestamp(),
      });
    }

    setOpenModal(false);
    setForm({ title: "", url: "" });
  };

  // Delete podcast
  const handleDelete = async (id) => {
    if (!confirm("Hapus podcast ini?")) return;
    await deleteDoc(doc(db, "podcasts", id));
  };

  // Filter search
  const filtered = podcasts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Podcast Pertanian 🎙️</h1>

          {parsed.role === "admin" && (
            <button
              onClick={openCreateModal}
              className="bg-green-700 text-white px-4 py-2 rounded shadow hover:bg-green-800"
            >
              Tambah Podcast
            </button>
          )}
        </div>

        {/* Search Box */}
        <input
          placeholder="Cari podcast..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 border rounded mb-6 shadow-sm"
        />

        {/* List Podcast */}
        <div className="space-y-4">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-5 rounded-xl shadow border"
            >
              <p className="text-lg font-bold text-green-800">{p.title}</p>

              <audio controls className="w-full mt-3">
                <source src={p.url} type="audio/mpeg" />
              </audio>

              {parsed.role === "admin" && (
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => openEditModal(p)}
                    className="px-3 py-1 bg-yellow-400 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* === MODAL === */}
      {openModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-6 rounded-xl shadow-xl w-96"
          >
            <h2 className="text-xl font-bold mb-4">
              {editId ? "Edit Podcast" : "Tambah Podcast"}
            </h2>

            <input
              placeholder="Judul podcast"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full p-2 border rounded mb-3"
            />

            <input
              placeholder="URL audio"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="w-full p-2 border rounded mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpenModal(false)}
                className="px-4 py-2 border rounded"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-700 text-white rounded"
              >
                Simpan
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}
