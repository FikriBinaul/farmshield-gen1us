import LandingHeader from "@/components/LandingHeader";
import { useRouter } from "next/router";
import { Code, Database, Globe } from "lucide-react";

export default function RPL() {
  const router = useRouter();

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      <LandingHeader />
      
      <div className="max-w-6xl mx-auto px-8 py-16 pt-24">
        <div className="text-center mb-12">
          <Code className="mx-auto mb-4 text-green-700" size={64} />
          <h1 className="text-5xl font-extrabold text-green-800 mb-4">Rekayasa Perangkat Lunak</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Pengembangan sistem perangkat lunak untuk solusi pertanian berbasis teknologi
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
            <Code className="text-green-700 mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-2">Pengembangan Web</h3>
            <p className="text-gray-600">
              Aplikasi web modern menggunakan teknologi Next.js, React, dan Tailwind CSS untuk user experience terbaik.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
            <Database className="text-green-700 mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-2">Manajemen Data</h3>
            <p className="text-gray-600">
              Sistem database yang aman untuk menyimpan data deteksi, riwayat pengguna, dan informasi pertanian.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
            <Globe className="text-green-700 mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-2">API & Integrasi</h3>
            <p className="text-gray-600">
              RESTful API untuk integrasi dengan berbagai sistem dan layanan eksternal secara efisien.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-green-800 mb-4">RPL di FarmShield</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            FarmShield dikembangkan menggunakan prinsip-prinsip rekayasa perangkat lunak yang baik, meliputi 
            pengembangan bertahap, pengujian menyeluruh, dan pemeliharaan berkala untuk memastikan sistem selalu 
            berjalan optimal.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Tim pengembangan menggunakan metodologi agile dengan fokus pada kebutuhan pengguna, keamanan data, 
            dan skalabilitas sistem untuk mendukung pertumbuhan platform di masa depan.
          </p>
        </div>
      </div>
    </div>
  );
}

