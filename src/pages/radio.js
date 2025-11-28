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
import { uploadPhoto, validateImageFile } from "@/lib/uploadHelper";
import { Image as ImageIcon, X, Youtube } from "lucide-react";

export default function Podcast() {
  const cookie = Cookies.get("user");
  const parsed = cookie ? JSON.parse(cookie) : { role: "user" };
  const Layout = parsed.role === "admin" ? AdminLayout : UserLayout;

  const [podcasts, setPodcasts] = useState([]);
  const [form, setForm] = useState({ title: "", url: "" });
  const [openModal, setOpenModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [urlError, setUrlError] = useState("");

  const detectMediaType = (url) => {
    if (!url) return "invalid";
    const youTubeId = extractYouTubeId(url);
    if (youTubeId) return "youtube";
    try {
      const parsed = new URL(url);
      const audioExtensions = [".mp3", ".wav", ".ogg", ".m4a", ".aac"];
      if (audioExtensions.some((ext) => parsed.pathname.endsWith(ext))) {
        return "audio";
      }
      return "audio"; // fallback: allow general audio streams
    } catch {
      return "invalid";
    }
  };

  const extractYouTubeId = (url) => {
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes("youtu.be")) {
        return parsed.pathname.slice(1);
      }
      if (parsed.hostname.includes("youtube.com")) {
        if (parsed.searchParams.get("v")) return parsed.searchParams.get("v");
        if (parsed.pathname.startsWith("/shorts/")) {
          return parsed.pathname.split("/")[2];
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    const videoId = extractYouTubeId(url);
    if (!videoId) return url;
    return `https://www.youtube.com/embed/${videoId}?rel=0`;
  };

  // Listener realtime
  useEffect(() => {
    const ref = collection(db, "podcasts");
    const qRef = query(ref, orderBy("createdAt", "desc"));
    
    const unsub = onSnapshot(qRef, (snapshot) => {
      setPodcasts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, []);

  // Photo handling
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setPhoto(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  // Buka modal untuk create
  const openCreateModal = () => {
    setForm({ title: "", url: "" });
    setEditId(null);
    setPhoto(null);
    setPhotoPreview(null);
    setOpenModal(true);
  };

  // Buka modal untuk edit
  const openEditModal = (p) => {
    setForm({ title: p.title, url: p.url });
    setEditId(p.id);
    setPhoto(null);
    setPhotoPreview(p.photoUrl || null);
    setOpenModal(true);
  };

  // Create or update
  const handleSubmit = async () => {
    if (!form.title || !form.url) return alert("Isi semua field!");

    // Reset url error
    setUrlError("");

    const mediaType = detectMediaType(form.url);
    if (mediaType === "invalid") {
      setUrlError("URL tidak valid. Masukkan link audio langsung atau link YouTube.");
      return;
    }

    setUploadingPhoto(!!photo);
    let photoUrl = null;

    if (photo) {
      try {
        photoUrl = await uploadPhoto(photo, 'radio');
      } catch (err) {
        console.error("Photo upload error:", err);
        alert("Gagal upload foto");
        setUploadingPhoto(false);
        return;
      }
    }

    try {
      if (editId) {
        const updateData = {
          title: form.title,
          url: form.url,
        };
        if (photoUrl) updateData.photoUrl = photoUrl;
        
        await updateDoc(doc(db, "podcasts", editId), updateData);
      } else {
        await addDoc(collection(db, "podcasts"), {
          title: form.title,
          url: form.url,
          photoUrl: photoUrl,
          createdAt: serverTimestamp(),
        });
      }

      setOpenModal(false);
      setForm({ title: "", url: "" });
      removePhoto();
    } catch (err) {
      console.error("Submit error:", err);
      alert("Gagal menyimpan podcast");
    } finally {
      setUploadingPhoto(false);
    }
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
              <div className="flex gap-4 mb-3">
                {p.photoUrl && (
                  <img
                    src={p.photoUrl}
                    alt={p.title}
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                )}
                <div className="flex-1">
                  <p className="text-lg font-bold text-green-800">{p.title}</p>
                </div>
              </div>

              {detectMediaType(p.url) === "youtube" ? (
                <div className="mt-3 aspect-video">
                  <iframe
                    src={getYouTubeEmbedUrl(p.url)}
                    title={p.title}
                    className="w-full h-full rounded-lg border border-gray-200"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <audio controls className="w-full mt-3">
                  <source src={p.url} type="audio/mpeg" />
                </audio>
              )}

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
              className="w-full p-2 border rounded mb-3"
            />
            {urlError && <p className="text-sm text-red-500 mb-2">{urlError}</p>}
            <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
              <Youtube className="w-4 h-4" />
              Dukungan: link file audio langsung atau link YouTube (contoh: https://youtu.be/xxxx)
            </p>

            {/* Photo Upload */}
            <div className="mb-4">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                <ImageIcon className="w-4 h-4" />
                <span className="text-sm">Tambah Foto Cover</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
              {photoPreview && (
                <div className="mt-2 relative inline-block">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="max-w-xs max-h-48 rounded-lg border border-gray-300"
                  />
                  <button
                    onClick={removePhoto}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpenModal(false)}
                className="px-4 py-2 border rounded"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={uploadingPhoto}
                className="px-4 py-2 bg-green-700 text-white rounded disabled:opacity-50"
              >
                {uploadingPhoto ? "Uploading..." : "Simpan"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}
