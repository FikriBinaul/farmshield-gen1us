import LandingHeader from "@/components/LandingHeader";
import { useRouter } from "next/router";
import { FileText, BookOpen, Edit } from "lucide-react";

export default function Tatatulis() {
  const router = useRouter();

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      <LandingHeader />
      
      <div className="max-w-6xl mx-auto px-8 py-16 pt-24">
        <div className="text-center mb-12">
          <FileText className="mx-auto mb-4 text-green-700" size={64} />
          <h1 className="text-5xl font-extrabold text-green-800 mb-4">Tatatulis</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Dokumentasi dan panduan penggunaan sistem FarmShield
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
            <BookOpen className="text-green-700 mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-2">Panduan Pengguna</h3>
            <p className="text-gray-600">
              Panduan lengkap untuk menggunakan fitur-fitur FarmShield, dari pendaftaran hingga deteksi hama.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
            <Edit className="text-green-700 mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-2">Dokumentasi Teknis</h3>
            <p className="text-gray-600">
              Dokumentasi teknis untuk pengembang dan administrator sistem FarmShield.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
            <FileText className="text-green-700 mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-2">FAQ</h3>
            <p className="text-gray-600">
              Pertanyaan yang sering diajukan beserta jawabannya untuk membantu pengguna memahami sistem.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-green-800 mb-4">Tentang Tatatulis</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            Halaman tatatulis menyediakan dokumentasi lengkap tentang FarmShield. Di sini Anda dapat menemukan 
            berbagai informasi mulai dari panduan penggunaan untuk pengguna umum hingga dokumentasi teknis untuk 
            pengembang.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Kami terus memperbarui dokumentasi untuk memastikan semua informasi selalu up-to-date dan mudah dipahami 
            oleh berbagai kalangan pengguna.
          </p>
        </div>
      </div>
    </div>
  );
}

