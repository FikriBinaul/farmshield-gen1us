"use client";

import { useState } from "react";
import Image from "next/image";
import LandingHeader from "@/components/LandingHeader";
import { Users, Sparkles, ShieldCheck } from "lucide-react";

const TEAM_MEMBERS = [
  {
    name: "Fikri Binaul Umah",
    nim: "J0404231038",
    role: "Lead Architect & Backend Engineer",
    photo: "/aboutus/Fikri.jpeg",
    quote:
      "Membangun fondasi sistem FarmShield dan memastikan seluruh proses backend berjalan cepat, stabil, dan dapat diandalkan di lapangan.",
  },
  {
    name: "Luthfi Alviani",
    nim: "J0404231023",
    role: "UI/UX & Frontend Developer",
    photo: "/aboutus/luthfi.jpeg",
    quote:
      "Menghadirkan antarmuka FarmShield yang intuitif supaya petani bisa memantau kondisi tanaman dengan mudah dan efisien.",
  },
  {
    name: "Muhammad Rifki Munawar",
    nim: "J0404231072",
    role: "Robotics Engineer",
    photo: "/aboutus/Rifki.png",
    quote:
      "Merancang dan mengoptimalkan sistem mekanik serta pergerakan robot FarmShield agar mampu beroperasi stabil di berbagai kondisi lahan.",
  },
  {
    name: "Alicia Maharani",
    nim: "J0404231090",
    role: "Machine Learning Specialist",
    photo: "/aboutus/alicia.jpeg",
    quote:
      "Mengolah dan melatih model prediksi FarmShield agar mampu mengenali gejala kutu putih dengan akurasi tinggi di situasi nyata.",
  },
];

const getOffset = (index, active, length) => {
  let offset = index - active;
  if (offset > length / 2) offset -= length;
  if (offset < -length / 2) offset += length;
  return offset;
};

export default function AboutUs() {
  const [activeMember, setActiveMember] = useState(0);

  const nextMember = () =>
    setActiveMember((prev) => (prev + 1) % TEAM_MEMBERS.length);
  const prevMember = () =>
    setActiveMember(
      (prev) => (prev - 1 + TEAM_MEMBERS.length) % TEAM_MEMBERS.length
    );

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      <LandingHeader />

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-16 pt-24 space-y-14">
        <section className="text-center space-y-6">
          <ShieldCheck className="mx-auto text-green-700" size={64} />
          <div>
            <p className="uppercase tracking-[0.3em] text-sm text-green-600 font-semibold">
              FarmShield Robotics
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-green-800 mt-2">
              Robot Penyemprot Pestisida dengan Pendeteksi Kutu Putih
            </h1>
          </div>
          <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto">
            FarmShield adalah platform robotik yang memadukan visi komputer,
            navigasi otonom, dan semprotan pestisida terukur untuk menahan
            serangan kutu putih sebelum merusak lahan. Semua dikerjakan oleh
            tim yang percaya bahwa petani butuh partner teknologi yang sigap.
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <Sparkles className="text-green-700 mb-4" size={36} />
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              Misi Lapangan
            </h3>
            <p className="text-gray-600">
              Membantu petani melakukan penyemprotan hanya saat dibutuhkan,
              tepat sasaran tanpa membuang pestisida secara berlebihan.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <Users className="text-green-700 mb-4" size={36} />
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              Tim Kompak
            </h3>
            <p className="text-gray-600">
              Empat inovator dengan fokus berbeda, namun satu tujuan: melindungi
              tanaman dari kutu putih menggunakan robot pintar.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <ShieldCheck className="text-green-700 mb-4" size={36} />
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              Identitas Produk
            </h3>
            <p className="text-gray-600">
              FarmShield dirancang seperti penjaga lahan—siap patroli,
              mengidentifikasi hama, dan menindak dengan semprotan selektif.
            </p>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-lg p-8 space-y-4">
          <h2 className="text-3xl font-bold text-green-800">
            Siapa di Balik FarmShield?
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            FarmShield dibangun oleh empat mahasiswa yang percaya teknologi
            harus mendukung petani. Robot ini menggabungkan kamera cerdas untuk
            mendeteksi kutu putih, modul semprot otomatis untuk menyalurkan
            pestisida, serta dashboard yang memudahkan pemantauan. Semua fitur
            dikembangkan dari kebutuhan lapangan nyata.
          </p>
        </section>

        <section className="bg-gray-900 text-white rounded-3xl p-6 md:p-10 space-y-6 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="uppercase tracking-[0.4em] text-xs text-green-300">
                Tim FarmShield
              </p>
              <h2 className="text-3xl md:text-4xl font-bold">
                Pilih Karakter Tim
              </h2>
              <p className="text-sm md:text-base text-white/70 mt-2">
                Geser untuk melihat peran setiap anggota.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={prevMember}
                className="w-12 h-12 rounded-full border border-white/30 text-white hover:bg-white/20 transition"
                aria-label="Anggota sebelumnya"
              >
                &#8592;
              </button>
              <button
                type="button"
                onClick={nextMember}
                className="w-12 h-12 rounded-full border border-white/30 text-white hover:bg-white/20 transition"
                aria-label="Anggota selanjutnya"
              >
                &#8594;
              </button>
            </div>
          </div>

          <div
            className="relative h-[430px] mt-6"
            style={{ perspective: "1600px" }}
          >
            {TEAM_MEMBERS.map((member, index) => {
              const offset = getOffset(
                index,
                activeMember,
                TEAM_MEMBERS.length
              );
              const isActive = offset === 0;
              const translateX = offset * 240;
              const rotateY = offset * -14;
              const scale = isActive ? 1 : 0.9;
              const opacity = Math.abs(offset) > 2 ? 0 : 1;

              return (
                <div
                  key={member.nim}
                  className="absolute top-1/2 left-1/2 w-full max-w-sm transition-all duration-500 ease-out pointer-events-none"
                  style={{
                    transform: `translate(-50%, -50%) translateX(${translateX}px) rotateY(${rotateY}deg) scale(${scale})`,
                    opacity,
                    zIndex: TEAM_MEMBERS.length - Math.abs(offset),
                  }}
                >
                  <div
                    className={`pointer-events-auto group relative bg-gradient-to-br from-white/10 to-white/5 rounded-[30px] p-1 border ${
                      isActive
                        ? "border-green-300"
                        : "border-white/10 hover:border-white/30"
                    } shadow-[0_25px_60px_rgba(0,0,0,0.35)] transition-transform duration-300`}
                  >
                    <div className="bg-gray-950 rounded-[26px] p-5 space-y-5 hover:-translate-y-1 hover:shadow-[0_40px_80px_rgba(0,0,0,0.45)] transition-transform duration-300">
                      <div className="relative h-56 rounded-2xl overflow-hidden border border-white/10">
                        <Image
                          src={member.photo}
                          alt={`Foto ${member.name}`}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 80vw, 360px"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-green-300 text-sm font-mono tracking-wide">
                          {member.nim}
                        </p>
                        <h3 className="text-2xl font-bold">{member.name}</h3>
                        <p className="text-green-100/80 text-sm uppercase tracking-[0.3em]">
                          {member.role}
                        </p>
                      </div>
                      <p className="text-gray-200 text-sm leading-relaxed">
                        “{member.quote}”
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-gradient-to-r from-green-600 to-green-800 rounded-3xl shadow-lg p-8 text-white space-y-4">
          <h2 className="text-3xl font-bold">Kontak & Kolaborasi</h2>
          <p className="text-lg text-white/90">
            Ada ide riset bersama atau uji coba lapangan? Silakan hubungi tim
            FarmShield kapan saja melalui jalur resmi kampus maupun media
            sosial komunitas pertanian. Kami terbuka untuk pilot project dan
            sesi demo.
          </p>
        </section>
      </main>
    </div>
  );
}

