import AdminLayout from "@/layouts/adminlayout";
import UserLayout from "@/layouts/userlayout";
import Cookies from "js-cookie";

export default function Deteksi() {
  const user = Cookies.get("user");
  const parsed = user ? JSON.parse(user) : { role: "user" };
  const Layout = parsed.role === "admin" ? AdminLayout : UserLayout;

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-4">Deteksi Kutu Putih 🐛</h1>
      <p className="text-gray-700 mb-6">
        Fitur untuk mendeteksi kutu putih menggunakan kamera atau gambar.
      </p>

      <div className="border rounded-lg p-6 bg-white shadow">
        <p>📸 Unggah gambar daun yang ingin dideteksi di sini.</p>
        <input type="file" accept="image/*" className="mt-3 border p-2 rounded" />
        <button className="mt-4 bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800">
          Jalankan Deteksi
        </button>
      </div>
    </Layout>
  );
}
