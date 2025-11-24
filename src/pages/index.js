"use client";

import { useRef } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import {
  Sprout,
  Camera,
  BookOpen,
  Users,
  Radio,
  BarChart3,
  Scan,
} from "lucide-react";

// Dynamic import untuk Three.js components (client-only, no SSR)
const FarmShield3DModel = dynamic(
  () => import("@/components/FarmShield3DModel"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-gray-500">Loading 3D Model...</div>
      </div>
    ),
  }
);

const fadeInUp = {
  hidden: { opacity: 0, y: 36 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Home() {
  const router = useRouter();
  const pageRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: pageRef,
    offset: ["start start", "end end"],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.8,
  });

  const heroShift = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5], [0.9, 0.3]);

  const featurePillars = [
    {
      title: "Perlindungan Adaptif",
      description:
        "Visi komputer yang dilatih pada klaster serangan kutu putih berbagai varietas hortikultura, siap beradaptasi pada cahaya ekstrem lapangan.",
      highlights: [
        "Segmentasi daun berlapis AI",
        "Normalisasi warna berbasis cahaya",
        "Model ML ter-update via OTA",
      ],
      icon: Sprout,
    },
    {
      title: "Operasional Live",
      description:
        "Pipeline deteksi yang menyatu dengan dasbor, radio komunitas, dan pembelajaran. Semua modul berbicara satu sama lain secara otomatis.",
      highlights: [
        "Sinkronisasi lintas perangkat",
        "Audit aktivitas per petak",
        "Integrasi ke modul Radio & Forum",
      ],
      icon: Camera,
    },
    {
      title: "Inteligensi Kolektif",
      description:
        "Forum dan ensiklopedia yang dibangun dari pengalaman petani, agronom dan AI agent. Semakin sering dipakai, semakin cerdas.",
      highlights: [
        "Kurasi artikel adaptif",
        "Kredit reputasi komunitas",
        "Analitik pola diskusi",
      ],
      icon: Users,
    },
    {
      title: "Insight Prediktif",
      description:
        "Data deteksi disulap menjadi insight proaktif: prediksi puncak serangan, rekomendasi tindakan, hingga laporan investor.",
      highlights: [
        "Heatmap infestasi",
        "Simulasi intervensi",
        "Ekspor laporan otomatis",
      ],
      icon: BarChart3,
    },
  ];

  const innovationTimeline = [
    {
      label: "Observasi",
      title: "Visi Spektral Multi-Device",
      copy:
        "Algoritme FarmShield menormalkan cahaya, suhu, dan noise sensor sehingga kamera ponsel di lapangan bisa menyaingi perangkat lab.",
      marker: "01",
    },
    {
      label: "Prediksi",
      title: "Model Risiko Mikroklimat",
      copy:
        "Analitik mikroklimat membaca polusi, kelembapan, dan pola angin untuk menilai arah penyebaran kutu putih sebelum terlihat kasat mata.",
      marker: "02",
    },
    {
      label: "Intervensi",
      title: "Protokol Tindakan Terhubung",
      copy:
        "Rekomendasi disinkronkan ke radio komunitas, dasbor tim, hingga logistik pestisida sehingga eksekusi berjalan tanpa friksi.",
      marker: "03",
    },
    {
      label: "Kolaborasi",
      title: "Loop Komunitas + AI",
      copy:
        "Pengetahuan petani senior diserap ke ensiklopedia interaktif dan divalidasi ulang oleh agen AI untuk menjaga akurasi jangka panjang.",
      marker: "04",
    },
  ];

  const liveModules = [
    {
      title: "Deteksi Real-Time",
      description: "Kamera perangkat berubah jadi sensor agronomi presisi.",
      icon: Scan,
      cta: () => router.push("/deteksi"),
      accent: "from-emerald-400/40 via-green-500/10 to-transparent",
    },
    {
      title: "Ensiklopedia Hidup",
      description:
        "Pengetahuan hama dan nutrisi yang direfresh AI tiap pekan.",
      icon: BookOpen,
      cta: () => router.push("/ensiklopedia"),
      accent: "from-sky-400/30 via-sky-500/10 to-transparent",
    },
    {
      title: "Forum Swarm-Intelligence",
      description: "Diskusi komunitas yang dimoderasi kecerdasan kolektif.",
      icon: Users,
      cta: () => router.push("/forum"),
      accent: "from-purple-500/30 via-purple-500/10 to-transparent",
    },
    {
      title: "Radio & Crisis Line",
      description:
        "Jalur komunikasi cepat saat terjadi ledakan infestasi lokal.",
      icon: Radio,
      cta: () => router.push("/radio"),
      accent: "from-orange-400/30 via-orange-500/10 to-transparent",
    },
  ];

  const kineticStats = [
    { label: "Frame teranalisis / jam", value: "1,2M" },
    { label: "Akurasi klasifikasi lapangan", value: "96.4%" },
    { label: "Lahan terlindungi saat ini", value: "38.200 ha" },
  ];

  return (
    <div
      ref={pageRef}
      className="relative bg-[#020609] text-white overflow-hidden"
    >
      <motion.span
        className="fixed top-0 left-0 h-1 bg-emerald-400 z-50 origin-left"
        style={{ scaleX: progress }}
      />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-1/3 left-1/2 w-[1200px] h-[1200px] -translate-x-1/2 rounded-full bg-emerald-500/30 blur-[220px]"
        style={{ opacity: glowOpacity }}
      />

      <main className="relative z-10 space-y-40">
        {/* HERO */}
        <section className="min-h-screen px-6 pt-24 pb-16 md:px-16 lg:px-24 flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            style={{ y: heroShift }}
            variants={fadeInUp}
            initial="hidden"
            animate="show"
            className="flex-1 space-y-8 max-w-2xl"
          >
            <p className="uppercase tracking-[0.3em] text-sm text-emerald-300">
              Generasi baru proteksi hortikultura
            </p>
            <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
              Scroll melewati orkestrasi AI + komunitas{" "}
              <span className="text-emerald-300">FarmShield</span>.
            </h1>
            <p className="text-lg text-white/70">
              Kami merajut deteksi kutu putih, pengetahuan agronomi, dan
              kolaborasi manusia ke dalam satu pengalaman scroll yang terasa
              mewah. Setiap section membuka lapisan baru sistem perlindungan.
            </p>

            <div className="flex flex-wrap gap-4">
              <motion.button
                onClick={() => router.push("/deteksi")}
                className="px-6 py-3 rounded-full bg-emerald-400 text-gray-900 font-semibold shadow-[0_10px_40px_rgba(16,185,129,0.35)]"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                type="button"
              >
                Mulai deteksi instan
              </motion.button>
              <motion.button
                onClick={() => router.push("/register")}
                className="px-6 py-3 rounded-full border border-white/30 text-white/80"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                type="button"
              >
                Aktivasi akun tim
              </motion.button>
            </div>

            <div className="flex flex-wrap gap-8 pt-4">
              {kineticStats.map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.8 }}
                >
                  <p className="text-3xl font-semibold text-white">
                    {stat.value}
                  </p>
                  <p className="text-sm uppercase tracking-widest text-white/50">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="flex-1 w-full h-[420px] md:h-[520px] rounded-[36px] bg-gradient-to-br from-emerald-400/10 to-white/5 p-1 shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="w-full h-full rounded-[32px] bg-[#060f11] border border-white/10">
              <FarmShield3DModel />
            </div>
          </motion.div>
        </section>

        {/* FEATURE PILLARS */}
        <section className="relative px-6 md:px-16 lg:px-24">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="max-w-3xl space-y-4">
              <p className="text-sm uppercase tracking-[0.4em] text-emerald-300">
                Layer demi layer
              </p>
              <h2 className="text-4xl md:text-5xl font-semibold leading-tight">
                Scroll menelusuri empat pilar proteksi menyeluruh.
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {featurePillars.map((pillar, index) => {
                const Icon = pillar.icon;
                return (
                  <motion.article
                    key={pillar.title}
                    className="relative p-[1px] rounded-3xl bg-gradient-to-b from-white/20 to-white/5 overflow-hidden"
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{
                      delay: index * 0.1,
                      duration: 0.9,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <div className="h-full rounded-3xl bg-[#050c0d]/90 p-8 space-y-6">
                      <div className="flex items-center gap-4">
                        <span className="p-3 rounded-2xl bg-white/10">
                          <Icon className="w-6 h-6 text-emerald-300" />
                        </span>
                        <h3 className="text-2xl font-semibold">
                          {pillar.title}
                        </h3>
                      </div>
                      <p className="text-white/70 leading-relaxed">
                        {pillar.description}
                      </p>
                      <div className="space-y-2">
                        {pillar.highlights.map((item) => (
                          <div
                            key={item}
                            className="flex items-center gap-2 text-sm text-white/70"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        {/* TIMELINE */}
        <section className="relative px-6 md:px-16 lg:px-24">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-[360px_1fr] gap-14">
            <motion.div
              className="space-y-6 lg:sticky lg:top-24 self-start"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.5 }}
              variants={fadeInUp}
            >
              <p className="text-sm tracking-[0.4em] uppercase text-emerald-300">
                Orkestrasi alur cerdas
              </p>
              <h2 className="text-4xl font-semibold leading-tight">
                Setiap scroll memicu fase inovasi berbeda.
              </h2>
              <p className="text-white/70">
                FarmShield memandu Anda dari observasi hingga kolaborasi kolektif
                lewat animasi timeline yang sinkron dengan ritme gulir.
              </p>
            </motion.div>

            <div className="relative pl-6 border-l border-white/10 space-y-12">
              {innovationTimeline.map((phase, index) => (
                <motion.article
                  key={phase.marker}
                  className="relative ml-4 rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur"
                  initial={{ opacity: 0, x: 80 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{
                    delay: index * 0.08,
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <span className="absolute -left-10 top-6 flex items-center justify-center w-10 h-10 rounded-full bg-emerald-400 text-gray-900 font-semibold">
                    {phase.marker}
                  </span>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                    {phase.label}
                  </p>
                  <h3 className="text-2xl font-semibold mt-2">{phase.title}</h3>
                  <p className="text-white/70 mt-3">{phase.copy}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* LIVE MODULES */}
        <section className="px-6 md:px-16 lg:px-24">
          <div className="max-w-6xl mx-auto space-y-8">
            <motion.div
              className="space-y-4"
              variants={fadeInUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <p className="text-sm uppercase tracking-[0.4em] text-emerald-300">
                Modul aktif
              </p>
              <h2 className="text-4xl font-semibold leading-tight">
                Seret secara horizontal untuk membuka akses cepat.
              </h2>
            </motion.div>

            <div className="overflow-x-auto pb-6">
              <div className="flex min-w-full gap-6 snap-x snap-mandatory">
                {liveModules.map((module) => {
                  const Icon = module.icon;
                  return (
                    <motion.button
                      key={module.title}
                      onClick={module.cta}
                      type="button"
                      className="relative snap-center min-w-[280px] lg:min-w-[320px] text-left rounded-3xl p-[1px] bg-gradient-to-br from-white/30 to-white/5"
                      whileHover={{ y: -6 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="rounded-3xl bg-[#04090c] p-8 h-full flex flex-col gap-6">
                        <span className="p-3 rounded-2xl bg-white/10 w-fit">
                          <Icon className="w-6 h-6 text-emerald-300" />
                        </span>
                        <div className="space-y-2">
                          <h3 className="text-2xl font-semibold">
                            {module.title}
                          </h3>
                          <p className="text-white/70 text-sm leading-relaxed">
                            {module.description}
                          </p>
                        </div>
                        <div className="mt-auto text-sm font-semibold text-emerald-300">
                          Masuk modul -&gt;
                        </div>
                      </div>
                      <div
                        className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${module.accent} opacity-40 pointer-events-none`}
                      />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* IMMERSIVE CTA */}
        <section className="px-6 md:px-16 lg:px-24 pb-24">
          <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-br from-emerald-500/10 via-emerald-900/40 to-black">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),_transparent_45%)]" />
            <div className="relative p-12 md:p-16 flex flex-col lg:flex-row gap-12 items-center">
              <motion.div
                className="flex-1 space-y-6"
                variants={fadeInUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                <p className="uppercase tracking-[0.4em] text-sm text-white/70">
                  Final gate
                </p>
                <h2 className="text-4xl md:text-5xl font-semibold leading-tight">
                  Jadikan setiap meter persegi terlindungi secara elegan.
                </h2>
                <p className="text-white/70 text-lg">
                  Bangun command center yang terasa futuristik - dengan deteksi
                  langsung, insight prediktif, dan komunitas yang selalu menyala.
                </p>
                <div className="flex flex-wrap gap-4">
                  <motion.button
                    onClick={() => router.push("/login")}
                    className="px-6 py-3 rounded-full bg-white text-gray-900 font-semibold"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                  >
                    Masuk dasbor
                  </motion.button>
                  <motion.button
                    onClick={() => router.push("/chat")}
                    className="px-6 py-3 rounded-full border border-white/30 text-white/80"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                  >
                    Konsultasi dengan ahli
                  </motion.button>
                </div>
              </motion.div>

              <motion.div
                className="w-full lg:w-1/2 h-[320px] md:h-[380px] rounded-[32px] border border-white/10 bg-black/40 backdrop-blur flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.8 }}
              >
                <div className="text-center space-y-4">
                  <p className="text-sm uppercase tracking-[0.5em] text-white/50">
                    Mode Panorama
                  </p>
                  <p className="text-3xl font-semibold">
                    Scroll hari ini, kontrol panen besok.
                  </p>
                  <p className="text-white/60 text-sm max-w-md mx-auto">
                    Visualisasi penuh FarmShield siap menyinari ruang rapat,
                    greenhouse, hingga command truck lapangan.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

