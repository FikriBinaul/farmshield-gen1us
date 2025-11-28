import LandingHeader from "@/components/LandingHeader";
import { useRouter } from "next/router";
import { Bot, Cpu, Settings } from "lucide-react";

export default function Robotik() {
  const router = useRouter();

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      <LandingHeader />
      
      <div className="max-w-6xl mx-auto px-8 py-16 pt-24">
        <div className="text-center mb-12">
          <Bot className="mx-auto mb-4 text-green-700" size={64} />
          <h1 className="text-5xl font-extrabold text-green-800 mb-4">Robotik</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Eksplorasi dunia robotik dan teknologi otomasi dalam pertanian modern
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
            <Cpu className="text-green-700 mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-2">Robot Pertanian</h3>
            <p className="text-gray-600">
              Robot yang digunakan untuk membantu proses pertanian, mulai dari penanaman hingga panen.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
            <Settings className="text-green-700 mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-2">Otomasi Sistem</h3>
            <p className="text-gray-600">
              Sistem otomatis untuk mengontrol irigasi, suhu, dan kondisi lingkungan lahan pertanian.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
            <Bot className="text-green-700 mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-2">Teknologi Cerdas</h3>
            <p className="text-gray-600">
              Integrasi kecerdasan buatan dengan robot untuk deteksi dan penanganan hama tanaman.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-green-800 mb-4">Tentang Robotik di FarmShield</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Robotik memainkan peran penting dalam revolusi pertanian modern. Di FarmShield, kami mengintegrasikan 
            teknologi robotik dengan sistem deteksi hama berbasis machine learning untuk menciptakan solusi pertanian 
            yang lebih efisien dan berkelanjutan.
          </p>
        </div>
      </div>
    </div>
  );
}

