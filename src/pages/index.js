import { useRouter } from "next/router";
import { Sprout, Camera, BookOpen, Users, Radio, BarChart3, Scan } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamic import untuk Three.js components (client-only, no SSR)
const FarmShield3DModel = dynamic(
  () => import("@/components/FarmShield3DModel"),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-gray-500">Loading 3D Model...</div>
      </div>
    )
}
);

export default function Home() {
  const router = useRouter();

  return (
    <div className="bg-gray-50 text-gray-800">

    {/* ======================= HERO SECTION (VIDEO + OVERLAY) ======================= */}
    <section className="relative min-h-screen flex items-center justify-between px-8 md:px-16 text-white overflow-hidden">
    
      {/* VIDEO BACKGROUND */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos/farm-bg.mkv"
        autoPlay
        muted
        loop
        playsInline
      />
    
      {/* OVERLAY HIJAU */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-700 to-green-900 opacity-80"></div>
    
      {/* CONTENT HERO */}
      <div className="relative z-10 max-w-3xl space-y-6 animate-fade-up">
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-lg">
          FarmShield: Deteksi Kutu Putih Real-Time Berbasis Machine Learning
        </h1>
    
        <p className="text-lg opacity-90">
          Solusi cerdas untuk melindungi tanaman hortikultura Anda dari serangan hama kutu putih —
          deteksi langsung dari kamera perangkat tanpa perlu unggah foto.
        </p>
    
        <p className="italic opacity-80">
          “Teknologi pertanian berbasis AI untuk petani modern Indonesia.”
        </p>
    
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => router.push("/login")}
            className="bg-white text-green-800 font-semibold px-6 py-3 rounded-xl shadow-lg hover:bg-gray-100 hover:scale-105 transition"
          >
            Mulai Deteksi Sekarang
          </button>
    
          <button
            onClick={() => router.push("/login")}
            className="bg-green-600 px-6 py-3 rounded-xl shadow-lg hover:bg-green-700 transition"
          >
            Masuk ke Dashboard
          </button>
        </div>
      </div>
    </section>


      {/* ======================= SECTION 2: APA ITU FARMSHIELD + 3D ======================= */}
      <section className="py-20 px-8 md:px-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
      
          {/* TEXT */}
          <div className="max-w-3xl">
            <h2 className="text-4xl font-bold mb-6 text-green-800">Apa itu FarmShield?</h2>
            <p className="text-lg leading-relaxed">
              FarmShield adalah sistem berbasis web yang memanfaatkan kamera perangkat dan model machine
              learning untuk mendeteksi kutu putih secara real-time pada tanaman tomat. Sistem ini menyediakan dashboard monitoring, forum petani, radio edukasi, dan
              ensiklopedia pertanian sebagai pusat informasi terpadu.
            </p>
          </div>
      
          {/* 3D MODEL */}
          <div className="w-[400px] h-[400px]">
            <FarmShield3DModel />
          </div>
      
        </div>
      </section>


      {/* ======================= SECTION 3: FITUR UTAMA ======================= */}
      <section className="py-20 bg-white px-8 md:px-20">
        <h2 className="text-4xl font-bold text-green-800 mb-10">Fitur Utama FarmShield</h2>

        <div className="grid md:grid-cols-3 gap-10">
          <FeatureCard
            title="Deteksi Hama Real-Time"
            icon={<Camera size={36} />}
            text="Deteksi kutu putih langsung dari kamera tanpa mengunggah gambar."
          />

          <FeatureCard
            title="Dashboard Monitoring"
            icon={<BarChart3 size={36} />}
            text="Pantau riwayat deteksi, intensitas serangan, dan catatan aktivitas."
          />

          <FeatureCard
            title="Ensiklopedia Hama"
            icon={<BookOpen size={36} />}
            text="Pengetahuan lengkap tentang hama, gejala, pencegahan, dan penanganan."
          />

          <FeatureCard
            title="Forum Petani"
            icon={<Users size={36} />}
            text="Diskusi, berbagi pengalaman, dan bertanya antar petani."
          />

          <FeatureCard
            title="Radio Petani"
            icon={<Radio size={36} />}
            text="Siaran edukasi pertanian berformat audio."
          />

          <FeatureCard
            title="Logging Aktivitas"
            icon={<Scan size={36} />}
            text="Semua aktivitas tercatat otomatis untuk analisis lebih lanjut."
          />
        </div>
      </section>

      {/* ======================= SECTION 4: CARA KERJA ======================= */}
      <section className="py-20 px-8 md:px-20 bg-gradient-to-br from-green-50 to-green-100">
        <h2 className="text-4xl font-bold text-green-800 mb-10">Cara Kerja FarmShield</h2>

        <ol className="space-y-6 text-lg max-w-3xl list-decimal ml-5">
          <li>Buka Website FarmShield langsung dari browser.</li>
          <li>Aktifkan kamera ketika diminta oleh browser.</li>
          <li>Model Machine Learning menganalisis video secara real-time.</li>
          <li>Hasil deteksi muncul instan.</li>
          <li>Data otomatis tersimpan ke dashboard Anda.</li>
        </ol>
      </section>

      {/* ======================= SECTION 5: KOMUNITAS ======================= */}
      <section className="py-20 px-8 md:px-20">
        <h2 className="text-4xl font-bold text-green-800 mb-6">Komunitas & Edukasi</h2>

        <div className="grid md:grid-cols-3 gap-8">
          <CommunityCard title="Forum Petani" icon={<Users size={30} />} />
          <CommunityCard title="Radio Petani" icon={<Radio size={30} />} />
          <CommunityCard title="Ensiklopedia" icon={<BookOpen size={30} />} />
        </div>
      </section>

      {/* ======================= SECTION 6: CTA AKHIR ======================= */}
      <section className="py-24 text-center bg-green-800 text-white px-8">
        <h2 className="text-4xl font-bold mb-4">
          Mulai Deteksi & Lindungi Tanaman Anda Hari Ini
        </h2>
        <p className="mb-8 opacity-90 text-lg">
          Tekan tombol di bawah untuk memulai deteksi hama secara real-time.
        </p>

        <button
          onClick={() => router.push("/deteksi")}
          className="bg-white text-green-800 font-semibold px-8 py-4 rounded-xl shadow-lg hover:bg-gray-100 hover:scale-110 transition"
        >
          Mulai Deteksi Sekarang
        </button>
      </section>
    </div>
  );
}

/* ======================= COMPONENTS ======================= */

function FeatureCard({ title, icon, text }) {
  return (
    <div className="p-6 rounded-2xl shadow-lg hover:shadow-xl bg-gray-50 border hover:scale-105 transition">
      <div className="text-green-700 mb-3">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-700">{text}</p>
    </div>
  );
}

function CommunityCard({ title, icon }) {
  return (
    <div className="p-6 rounded-2xl border bg-white shadow hover:shadow-lg hover:scale-105 transition text-center">
      <div className="mb-3 text-green-700 flex justify-center">{icon}</div>
      <h3 className="font-semibold text-lg">{title}</h3>
    </div>
  );
}
