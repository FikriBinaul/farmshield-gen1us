import LandingHeader from "@/components/LandingHeader";
import { useRouter } from "next/router";
import { Brain, TrendingUp, Target } from "lucide-react";

export default function MesinLearning() {
  const router = useRouter();

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      <LandingHeader />
      
      <div className="max-w-6xl mx-auto px-8 py-16 pt-24">
        <div className="text-center mb-12">
          <Brain className="mx-auto mb-4 text-green-700" size={64} />
          <h1 className="text-5xl font-extrabold text-green-800 mb-4">Mesin Learning</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Teknologi machine learning untuk deteksi hama secara akurat dan real-time
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
            <Target className="text-green-700 mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-2">Deteksi Akurat</h3>
            <p className="text-gray-600">
              Model machine learning yang telah dilatih untuk mengenali kutu putih dengan tingkat akurasi tinggi.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
            <TrendingUp className="text-green-700 mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-2">Pembelajaran Terus Menerus</h3>
            <p className="text-gray-600">
              Model terus belajar dan meningkatkan akurasi seiring dengan bertambahnya data deteksi.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
            <Brain className="text-green-700 mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-2">Real-Time Processing</h3>
            <p className="text-gray-600">
              Analisis gambar secara real-time langsung dari kamera perangkat Anda tanpa delay yang berarti.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-green-800 mb-4">Machine Learning di FarmShield</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            FarmShield menggunakan teknologi machine learning berbasis deep learning untuk mendeteksi serangan hama 
            kutu putih pada tanaman tomat. Model kami dilatih dengan ribuan gambar tanaman sehat dan terinfeksi untuk 
            mencapai tingkat akurasi yang optimal.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Sistem ini bekerja dengan menganalisis gambar dari kamera secara real-time, mengidentifikasi pola dan 
            karakteristik kutu putih, kemudian memberikan notifikasi serta rekomendasi penanganan kepada pengguna.
          </p>
        </div>
      </div>
    </div>
  );
}

