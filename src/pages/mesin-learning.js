import LandingHeader from "@/components/LandingHeader";
import { useRouter } from "next/router";
import { Brain, TrendingUp, Target, ZoomIn, X } from "lucide-react";
import { useState } from "react";

export default function MesinLearning() {
  const router = useRouter();
  const [zoomImage, setZoomImage] = useState(null);

  // File epoch untuk perbandingan
  const epochFiles = [
    { name: "25 Epoch", path: "/mesin/25epoch.png" },
    { name: "50 Epoch", path: "/mesin/50epoch.png" },
    { name: "100 Epoch", path: "/mesin/100epoch.png" },
  ];

  // File confusion matrix
  const matrixFiles = [
    { name: "25 Epoch", path: "/mesin/matrix/25epoch.png" },
    { name: "50 Epoch", path: "/mesin/matrix/50epoch.png" },
    { name: "100 Epoch", path: "/mesin/matrix/100epoch.png" },
  ];

  // File hasil deteksi
  const hasilDeteksiFiles = [
    { name: "Hasil Deteksi 1", path: "/mesin/hasil deteksi/hasil1.png" },
    { name: "Hasil Deteksi 2", path: "/mesin/hasil deteksi/hasil2.png" },
  ];

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      <LandingHeader />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 pt-24">
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

        {/* Perbandingan Epoch */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-green-800 mb-6 flex items-center gap-3">
            <TrendingUp size={32} />
            Perbandingan Training: 25, 50, dan 100 Epoch
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {epochFiles.map((file, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
                onClick={() => setZoomImage(file.path)}
              >
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white">
                  <h3 className="text-xl font-bold">{file.name}</h3>
                  <p className="text-green-100 text-sm mt-1">Hasil Training Model</p>
                </div>
                <div className="relative aspect-video bg-gray-100">
                  <img
                    src={file.path}
                    alt={file.name}
                    className="w-full h-full object-contain p-4"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                    <ZoomIn className="text-white opacity-0 hover:opacity-100 transition-opacity" size={32} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Catatan:</strong> Perbandingan ini menunjukkan perkembangan model selama proses training. 
              Epoch yang lebih tinggi umumnya menghasilkan akurasi yang lebih baik, namun memerlukan waktu training yang lebih lama.
            </p>
          </div>
        </div>

        {/* Confusion Matrix */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-green-800 mb-6 flex items-center gap-3">
            <Target size={32} />
            Confusion Matrix: 25, 50, dan 100 Epoch
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {matrixFiles.map((file, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
                onClick={() => setZoomImage(file.path)}
              >
                <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-4 text-white">
                  <h3 className="text-xl font-bold">Confusion Matrix {file.name}</h3>
                  <p className="text-orange-100 text-sm mt-1">Evaluasi Performa Model</p>
                </div>
                <div className="relative aspect-square bg-gray-100">
                  <img
                    src={file.path}
                    alt={`Confusion Matrix ${file.name}`}
                    className="w-full h-full object-contain p-4"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                    <ZoomIn className="text-white opacity-0 hover:opacity-100 transition-opacity" size={32} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800">
              <strong>Penjelasan:</strong> Confusion matrix menunjukkan performa model dalam mengklasifikasikan data. 
              Matrix ini membantu memahami tingkat akurasi, precision, recall, dan F1-score model pada setiap epoch training.
            </p>
          </div>
        </div>

        {/* Hasil Deteksi */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-green-800 mb-6 flex items-center gap-3">
            <Target size={32} />
            Hasil Deteksi Model
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {hasilDeteksiFiles.map((file, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
                onClick={() => setZoomImage(file.path)}
              >
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 text-white">
                  <h3 className="text-xl font-bold">{file.name}</h3>
                  <p className="text-purple-100 text-sm mt-1">Contoh Hasil Deteksi Kutu Putih</p>
                </div>
                <div className="relative aspect-video bg-gray-100">
                  <img
                    src={file.path}
                    alt={file.name}
                    className="w-full h-full object-contain p-4"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                    <ZoomIn className="text-white opacity-0 hover:opacity-100 transition-opacity" size={32} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <strong>Penjelasan:</strong> Hasil deteksi menunjukkan kemampuan model untuk mengidentifikasi kutu putih 
              pada tanaman. Model menggunakan bounding box untuk menandai lokasi hama yang terdeteksi dengan tingkat 
              confidence tertentu.
            </p>
          </div>
        </div>

        {/* Informasi Tambahan */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-green-800 mb-4">Machine Learning di FarmShield</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            FarmShield menggunakan teknologi machine learning berbasis deep learning untuk mendeteksi serangan hama 
            kutu putih pada tanaman tomat. Model kami dilatih dengan ribuan gambar tanaman sehat dan terinfeksi untuk 
            mencapai tingkat akurasi yang optimal.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            Sistem ini bekerja dengan menganalisis gambar dari kamera secara real-time, mengidentifikasi pola dan 
            karakteristik kutu putih, kemudian memberikan notifikasi serta rekomendasi penanganan kepada pengguna.
          </p>
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Teknologi yang Digunakan</h3>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• YOLO (You Only Look Once) untuk object detection</li>
                <li>• Deep Learning dengan Convolutional Neural Network</li>
                <li>• Transfer Learning untuk optimasi model</li>
                <li>• Real-time image processing</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Keunggulan Model</h3>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• Akurasi deteksi tinggi</li>
                <li>• Deteksi real-time tanpa delay signifikan</li>
                <li>• Dapat mendeteksi multiple objects sekaligus</li>
                <li>• Robust terhadap variasi kondisi pencahayaan</li>
              </ul>
            </div>
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
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
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

