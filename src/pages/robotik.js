
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import LandingHeader from "@/components/LandingHeader";
import { Bot, Cpu, Settings, FileText, Video, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

// 3D model hanya dirender di client
const FarmShield3DModel = dynamic(
  () => import("@/components/FarmShield3DModel"),
  { ssr: false }
);

const ROBOT_IMAGES = [
  "/robotik/WhatsApp Image 2025-11-24 at 19.08.59 (1).jpeg",
  "/robotik/WhatsApp Image 2025-11-24 at 19.08.59 (2).jpeg",
  "/robotik/WhatsApp Image 2025-11-24 at 19.08.59 (3).jpeg",
  "/robotik/WhatsApp Image 2025-11-24 at 19.08.59 (4).jpeg",
  "/robotik/WhatsApp Image 2025-11-24 at 19.08.59 (5).jpeg",
  "/robotik/WhatsApp Image 2025-11-24 at 19.08.59 (6).jpeg",
  "/robotik/WhatsApp Image 2025-11-24 at 19.08.59 (7).jpeg",
];

export default function Robotik() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % ROBOT_IMAGES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? ROBOT_IMAGES.length - 1 : prev - 1
    );
  };

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      <LandingHeader />

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-16 pt-24 space-y-16">
        {/* HERO */}
        <section className="text-center">
          <Bot className="mx-auto mb-4 text-green-700" size={64} />
          <h1 className="text-4xl md:text-5xl font-extrabold text-green-800 mb-4">
            Robot Pendeteksi Kutu Putih
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Sistem robotik cerdas untuk mendeteksi dan memantau serangan{" "}
            <span className="font-semibold text-green-700">kutu putih</span>{" "}
            pada tanaman, terintegrasi dengan FarmShield agar petani bisa
            bertindak lebih cepat dan akurat.
          </p>
        </section>

        {/* KONTEN UTAMA: skema, 3D, video */}
        <section className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Skema rangkaian */}
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Cpu className="text-green-700" size={28} />
              <h2 className="text-xl font-bold text-green-800">
                Skema Rangkaian Robot
              </h2>
            </div>
            <p className="text-sm text-gray-600">
              Skema rangkaian elektronik robot pendeteksi kutu putih, berisi
              koneksi sensor, mikrokontroler, dan aktuator.
            </p>
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 border">
              <Image
                src="/gamtek/skema/skema.jpeg"
                alt="Skema rangkaian robot pendeteksi kutu putih"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
              />
            </div>
          </div>

          {/* Model 3D */}
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="text-green-700" size={28} />
              <h2 className="text-xl font-bold text-green-800">
                Model 3D Robot
              </h2>
            </div>
            <p className="text-sm text-gray-600">
              Visualisasi 3D robot yang dapat kamu putar dan zoom untuk melihat
              detail desain mekaniknya.
            </p>
            <div className="h-64 md:h-72 rounded-lg overflow-hidden border bg-gray-900">
              <FarmShield3DModel />
            </div>
          </div>

          {/* Video animasi */}
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Video className="text-green-700" size={28} />
              <h2 className="text-xl font-bold text-green-800">
                Video Animasi Robot
              </h2>
            </div>
            <p className="text-sm text-gray-600">
              Animasi kerja robot saat berpatroli dan mendeteksi kutu putih di
              area tanaman.
            </p>
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
              <video
                className="w-full h-full object-cover"
                controls
                src="/videos/farm-bg.mkv"
              >
                Browser kamu tidak mendukung pemutar video.
              </video>
            </div>
          </div>
        </section>

        {/* GAMTEK & LAPORAN */}
        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="text-green-700" size={28} />
              <h2 className="text-xl font-bold text-green-800">
                Gamtek Robotik
              </h2>
            </div>
            <p className="text-sm text-gray-600">
              Dokumen gambaran teknis (gamtek) yang menjelaskan konsep,
              komponen, dan cara kerja robot pendeteksi kutu putih.
            </p>
            <div className="h-[420px] w-full border rounded-lg overflow-hidden">
              <iframe
                src="/gamtek/gamtek%20robotik%20v3.pdf#view=FitH"
                title="Gamtek robotik"
                className="w-full h-full"
              />
            </div>
            <p className="text-xs text-gray-500 text-center">
              Jika PDF tidak muncul,{" "}
              <a
                href="/gamtek/gamtek%20robotik%20v3.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 underline"
              >
                buka di tab baru
              </a>
              .
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="text-green-700" size={28} />
              <h2 className="text-xl font-bold text-green-800">
                Laporan Akhir Robotik
              </h2>
            </div>
            <p className="text-sm text-gray-600">
              Laporan lengkap pengembangan robotik, mulai dari latar belakang,
              perancangan, implementasi, hingga pengujian sistem.
            </p>
            <div className="h-[420px] w-full border rounded-lg overflow-hidden">
              <iframe
                src="/laporanrobotik/Laporan%20Akhir%20Robotik.pdf#view=FitH"
                title="Laporan akhir robotik"
                className="w-full h-full"
              />
            </div>
            <p className="text-xs text-gray-500 text-center">
              Jika PDF tidak muncul,{" "}
              <a
                href="/laporanrobotik/Laporan%20Akhir%20Robotik.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 underline"
              >
                buka di tab baru
              </a>
              .
            </p>
          </div>
        </section>

        {/* SLIDER FOTO ROBOTIK */}
        <section className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <ImageIcon className="text-green-700" size={28} />
            <h2 className="text-xl font-bold text-green-800">
              Galeri Robotik
            </h2>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Dokumentasi foto robot pendeteksi kutu putih dari berbagai sudut
            dan tahap pengembangan. Gunakan tombol kiri/kanan untuk melihat
            foto lainnya.
          </p>

          <div className="relative w-full max-w-3xl mx-auto">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border">
              <Image
                key={ROBOT_IMAGES[currentSlide]}
                src={ROBOT_IMAGES[currentSlide]}
                alt={`Foto robotik ${currentSlide + 1}`}
                fill
                className="object-cover transition-all duration-300"
                sizes="(max-width: 768px) 100vw, 60vw"
              />
            </div>

            {/* Tombol navigasi */}
            <button
              type="button"
              onClick={prevSlide}
              className="absolute top-1/2 -translate-y-1/2 left-2 md:-left-10 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-md transition"
            >
              &#8592;
            </button>
            <button
              type="button"
              onClick={nextSlide}
              className="absolute top-1/2 -translate-y-1/2 right-2 md:-right-10 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-md transition"
            >
              &#8594;
            </button>

            {/* Indikator */}
            <div className="flex justify-center gap-2 mt-3">
              {ROBOT_IMAGES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 w-2 rounded-full transition ${
                    idx === currentSlide
                      ? "bg-green-700 w-4"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Pilih foto ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

