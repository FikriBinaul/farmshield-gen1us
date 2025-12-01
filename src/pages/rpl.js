import LandingHeader from "@/components/LandingHeader";
import { useRouter } from "next/router";
import { Code, Database, Globe, FileText, ChevronLeft, ChevronRight, Download, ZoomIn, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function RPL() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [zoomImage, setZoomImage] = useState(null);

  // File gambar dari folder rpl
  const rplFiles = [
    { name: "Class Diagram", path: "/rpl/Class Diagram.jpg" },
    { name: "ERD", path: "/rpl/ERD.jpg" },
    { name: "Use Case Diagram", path: "/rpl/Use Case Diagram.jpg" },
  ];

  // File activity diagram (bisa di-slide)
  const activityDiagrams = [
    { name: "Activity Diagram – Forum Komunitas", path: "/activitydiagram/_Activity Diagram – Forum Komunitas.png" },
    { name: "Activity Diagram – Akun", path: "/activitydiagram/Activity Diagram – Akun.png.jpg" },
    { name: "Activity Diagram – Chat AI Assistant", path: "/activitydiagram/Activity Diagram – Chat AI Assistant.png" },
    { name: "Activity Diagram – Chat Antar Pengguna", path: "/activitydiagram/Activity Diagram – Chat Antar Pengguna.png" },
    { name: "Activity Diagram – Dashboard Statistik (Admin)", path: "/activitydiagram/Activity Diagram – Dashboard Statistik (Admin).png" },
    { name: "Activity Diagram – Deteksi Kutu Putih Real‑Time", path: "/activitydiagram/Activity Diagram – Deteksi Kutu Putih Real‑Time.png" },
    { name: "Activity Diagram – Ensiklopedia Pertanian", path: "/activitydiagram/Activity Diagram – Ensiklopedia Pertanian.png" },
    { name: "Activity Diagram – Logout", path: "/activitydiagram/Activity Diagram – Logout.png" },
    { name: "Activity Diagram – Registrasi & Login", path: "/activitydiagram/Activity Diagram – Registrasi & Login.png" },
  ];

  // File PDF dari folder skpl dan dppl
  const pdfFiles = [
    { name: "SKPL - Kelompok 1 Gen1us", path: "/skpl/Kelompok 1 Gen1us_SKPL_FIKS.pdf" },
    { name: "DPPL - Kelompok 1 Gen1us", path: "/dppl/Kelompok 1 Gen1us_DDPL_FIKS.pdf" },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activityDiagrams.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + activityDiagrams.length) % activityDiagrams.length);
  };

  // Auto-slide untuk activity diagram
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activityDiagrams.length);
    }, 5000); // Ganti slide setiap 5 detik
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      <LandingHeader />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 pt-24">
        <div className="text-center mb-12">
          <Code className="mx-auto mb-4 text-green-700" size={64} />
          <h1 className="text-5xl font-extrabold text-green-800 mb-4">Rekayasa Perangkat Lunak</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Pengembangan sistem perangkat lunak untuk solusi pertanian berbasis teknologi
          </p>
        </div>

        {/* File gambar dari folder rpl */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-green-800 mb-6 flex items-center gap-3">
            <Database size={32} />
            Diagram RPL
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {rplFiles.map((file, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
                onClick={() => setZoomImage(file.path)}
              >
                <div className="relative aspect-video bg-gray-100">
                  <img
                    src={file.path}
                    alt={file.name}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                    <ZoomIn className="text-white opacity-0 hover:opacity-100 transition-opacity" size={32} />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-800">{file.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Diagram Carousel */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-green-800 mb-6 flex items-center gap-3">
            <Code size={32} />
            Activity Diagram
          </h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="relative">
              {/* Carousel Container */}
              <div className="relative overflow-hidden" style={{ height: "600px" }}>
                {activityDiagrams.map((diagram, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      index === currentSlide ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <img
                      src={diagram.path}
                      alt={diagram.name}
                      className="w-full h-full object-contain p-4"
                    />
                  </div>
                ))}
              </div>

              {/* Navigation Buttons */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all hover:scale-110"
                aria-label="Previous slide"
              >
                <ChevronLeft size={24} className="text-green-700" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all hover:scale-110"
                aria-label="Next slide"
              >
                <ChevronRight size={24} className="text-green-700" />
              </button>

              {/* Slide Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {activityDiagrams.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSlide
                        ? "w-8 bg-green-600"
                        : "w-2 bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Current Slide Info */}
            <div className="p-4 bg-gray-50 border-t">
              <p className="text-center font-semibold text-gray-800">
                {activityDiagrams[currentSlide].name} ({currentSlide + 1} / {activityDiagrams.length})
              </p>
            </div>
          </div>
        </div>

        {/* File PDF dari folder skpl dan dppl */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-green-800 mb-6 flex items-center gap-3">
            <FileText size={32} />
            Dokumen SKPL & DPPL
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {pdfFiles.map((file, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText size={32} />
                      <div>
                        <h3 className="text-xl font-bold">{file.name}</h3>
                        <p className="text-green-100 text-sm mt-1">Dokumen PDF</p>
                      </div>
                    </div>
                    <a
                      href={file.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    >
                      <Download size={20} />
                      <span>Download</span>
                    </a>
                  </div>
                </div>

                <div className="p-4 bg-gray-100">
                  <div className="relative w-full" style={{ minHeight: "600px" }}>
                    <iframe
                      src={`${file.path}#toolbar=1&navpanes=1&scrollbar=1`}
                      className="w-full h-full border-0 rounded-lg"
                      style={{ minHeight: "600px" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setZoomImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={() => setZoomImage(null)}
            aria-label="Close"
          >
            <X size={32} />
          </button>
          <img
            src={zoomImage}
            alt="Zoomed"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

