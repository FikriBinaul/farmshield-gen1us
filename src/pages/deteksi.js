// pages/deteksi.jsx
import { useEffect, useRef, useState } from "react";
import AdminLayout from "@/layouts/adminlayout";
import UserLayout from "@/layouts/userlayout";
import Cookies from "js-cookie";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function Deteksi() {
  const user = Cookies.get("user");
  const parsed = user ? JSON.parse(user) : { role: "user" };
  const Layout = parsed.role === "admin" ? AdminLayout : UserLayout;

  // Ganti dengan URL FastAPI publik kamu (ngrok / domain)
  const FASTAPI_BASE = "https://muriatic-unbeneficially-meri.ngrok-free.dev";

  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [polling, setPolling] = useState(true);

  // SWR untuk polling result endpoint (cara gampang)
  const { data, error: swrError } = useSWR(
    polling ? `${FASTAPI_BASE}/result` : null,
    fetcher,
    { refreshInterval: 400 } // polling 400ms
  );

  useEffect(() => {
    if (swrError) {
      setError("Gagal mengambil hasil deteksi.");
      return;
    }
    if (data) {
      setResult(data);
    }
  }, [data, swrError]);

  // Draw overlay whenever result updates or image resizes
  useEffect(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const draw = () => {
      const ctx = canvas.getContext("2d");
      // Resize canvas to displayed img size
      const displayW = img.clientWidth;
      const displayH = img.clientHeight;
      canvas.width = displayW;
      canvas.height = displayH;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!result || !result.boxes || !result.frame_size) return;

      // Original frame size from backend
      const origW = result.frame_size.w || result.frame_size.width || displayW;
      const origH = result.frame_size.h || result.frame_size.height || displayH;

      // Scale factors
      const scaleX = displayW / origW;
      const scaleY = displayH / origH;

      ctx.lineWidth = 3;
      ctx.font = "16px Arial";
      ctx.textBaseline = "top";

      result.boxes.forEach((b) => {
        if (!b.xyxy || b.xyxy.length < 4) return;
        const [x1, y1, x2, y2] = b.xyxy;
        const w = (x2 - x1) * scaleX;
        const h = (y2 - y1) * scaleY;
        const dx = x1 * scaleX;
        const dy = y1 * scaleY;

        // rectangle
        ctx.strokeStyle = "lime";
        ctx.strokeRect(dx, dy, w, h);

        // label bg
        const label = `${b.class_name || "obj"} ${(b.confidence ? (b.confidence*100).toFixed(1) : "0.0")}%`;
        const textMetrics = ctx.measureText(label);
        const padding = 6;
        const tw = textMetrics.width + padding * 2;
        const th = 20 + 4;
        ctx.fillStyle = "rgba(0,128,0,0.7)";
        ctx.fillRect(dx, Math.max(dy - th, 0), tw, th);

        // label text
        ctx.fillStyle = "white";
        ctx.fillText(label, dx + padding, Math.max(dy - th + 2, 0));
      });
    };

    // redraw on load and on window resize
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [result]);

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Deteksi Kutu Putih — Streaming</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded bg-white p-4 shadow">
            <h2 className="font-semibold mb-2">Streaming</h2>

            <div className="relative w-full" style={{ minHeight: 360 }}>
              <img
                ref={imgRef}
                src={`${FASTAPI_BASE}/video`}
                alt="stream"
                className="w-full h-auto max-h-[640px] object-contain border"
                style={{ display: "block" }}
                onError={() => setError("Gagal memuat stream. Cek URL / CORS / server")}
              />

              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 pointer-events-none"
                style={{ width: "100%", height: "100%" }}
              />
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => setPolling(true)}
                className="px-3 py-2 bg-blue-600 text-white rounded"
              >
                Mulai Polling Hasil
              </button>
              <button
                onClick={() => setPolling(false)}
                className="px-3 py-2 bg-gray-400 text-white rounded"
              >
                Stop Polling
              </button>
              <p className="ml-3 text-sm text-gray-600">Polling hasil dari endpoint /result</p>
            </div>
          </div>

          <div className="rounded bg-white p-4 shadow">
            <h2 className="font-semibold mb-2">Hasil Deteksi</h2>

            {error && (
              <div className="mb-3 text-red-600">{error}</div>
            )}

            {!result ? (
              <p className="text-gray-600">Menunggu hasil…</p>
            ) : (
              <div>
                <p className="mb-2">
                  <strong>Jumlah:</strong> {result.count}
                </p>

                {result.boxes && result.boxes.length > 0 ? (
                  <div className="space-y-2">
                    {result.boxes.map((b, i) => (
                      <div key={i} className="p-2 border rounded">
                        <div className="text-sm">
                          <strong>{b.class_name}</strong> — {(b.confidence*100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600">
                          xyxy: [{b.xyxy.join(", ")}]
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Tidak ada objek terdeteksi.</p>
                )}

                <div className="mt-3 text-xs text-gray-500">
                  <div>Frame original: {result.frame_size?.w} x {result.frame_size?.h}</div>
                  <div>Timestamp: {new Date(result.timestamp).toLocaleString()}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
