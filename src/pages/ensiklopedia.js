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
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import { BookOpen, Plus, Edit2, Trash2 } from "lucide-react";

// 🔧 Reusable Modal
function Modal({ open, onClose, onSubmit, title, data, setData }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">{title}</h2>

        <input
          type="text"
          placeholder="Judul artikel"
          value={data.title}
          onChange={(e) => setData({ ...data, title: e.target.value })}
          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-3 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <textarea
          placeholder="Konten artikel"
          value={data.content}
          onChange={(e) => setData({ ...data, content: e.target.value })}
          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-3 rounded-lg h-36 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button variant="success" onClick={onSubmit}>
            Simpan
          </Button>
        </div>
      </Card>
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
      <div className="p-3 md:p-6">
        <PageHeader
          title="Ensiklopedia Pertanian"
          description="Kumpulan artikel dan informasi tentang pertanian"
          action={
            parsed.role === "admin" && (
              <Button
                variant="success"
                onClick={() => {
                  setForm({ title: "", content: "" });
                  setEditID(null);
                  setModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2 inline" />
                Tambah Artikel
              </Button>
            )
          }
        />

        {/* Modal Form */}
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          title={editID ? "Edit Artikel" : "Tambah Artikel"}
          data={form}
          setData={setForm}
        />

        {/* Loading */}
        {loading && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Memuat data...
          </div>
        )}

        {/* Artikel List */}
        {!loading && articles.length === 0 && (
          <Card className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">Belum ada artikel</p>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {articles.map((item) => (
            <Card key={item.id} className="hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-100">
                  {item.title}
                </h2>
              </div>
              <p className="whitespace-pre-line text-gray-700 dark:text-gray-300 mb-4">
                {item.content}
              </p>

              {parsed.role === "admin" && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setForm({ title: item.title, content: item.content });
                      setEditID(item.id);
                      setModalOpen(true);
                    }}
                    className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 border-yellow-400"
                  >
                    <Edit2 className="w-3 h-3 mr-1 inline" />
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-3 h-3 mr-1 inline" />
                    Hapus
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
