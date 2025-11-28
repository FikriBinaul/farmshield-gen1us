import LandingHeader from "@/components/LandingHeader";
import { useRouter } from "next/router";
import { Users, Target, Heart } from "lucide-react";

export default function AboutUs() {
  const router = useRouter();

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      <LandingHeader />
      
      <div className="max-w-6xl mx-auto px-8 py-16 pt-24">
        <div className="text-center mb-12">
          <Users className="mx-auto mb-4 text-green-700" size={64} />
          <h1 className="text-5xl font-extrabold text-green-800 mb-4">Tentang Kami</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Kenali tim dan visi misi FarmShield dalam mewujudkan pertanian modern Indonesia
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
            <Target className="text-green-700 mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-2">Visi</h3>
            <p className="text-gray-600">
              Menjadi platform terdepan dalam teknologi pertanian berbasis AI untuk mendukung pertanian modern Indonesia.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
            <Heart className="text-green-700 mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-2">Misi</h3>
            <p className="text-gray-600">
              Memberikan solusi teknologi yang mudah digunakan, akurat, dan terjangkau untuk petani Indonesia.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
            <Users className="text-green-700 mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-2">Tim</h3>
            <p className="text-gray-600">
              Tim terdiri dari ahli teknologi, pertanian, dan machine learning yang berdedikasi tinggi.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-green-800 mb-4">Sejarah FarmShield</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            FarmShield lahir dari kebutuhan akan solusi teknologi yang dapat membantu petani mendeteksi dan mengatasi 
            serangan hama dengan lebih cepat dan akurat. Dengan memanfaatkan teknologi machine learning dan pengembangan 
            web modern, kami menciptakan platform yang dapat digunakan oleh petani di seluruh Indonesia.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Kami berkomitmen untuk terus mengembangkan dan meningkatkan FarmShield dengan mendengarkan masukan dari 
            para petani dan pengguna aktif kami, sehingga platform ini dapat benar-benar membantu meningkatkan produktivitas 
            dan kualitas hasil pertanian.
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Kontak Kami</h2>
          <p className="text-lg opacity-90">
            Jika Anda memiliki pertanyaan, saran, atau ingin berkolaborasi dengan kami, jangan ragu untuk menghubungi 
            kami melalui email atau media sosial resmi FarmShield.
          </p>
        </div>
      </div>
    </div>
  );
}

