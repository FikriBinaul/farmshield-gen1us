// pages/deteksi.jsx
import { useEffect, useRef, useState } from "react";
import AdminLayout from "@/layouts/adminlayout";
import UserLayout from "@/layouts/userlayout";
import Cookies from "js-cookie";
import useSWR from "swr";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import { Camera, AlertCircle, CheckCircle, XCircle, History } from "lucide-react";
import { realtimedb } from "@/lib/firebase";
import { ref, set, onValue } from "firebase/database";
import Table, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from "@/components/ui/Table";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function Deteksi() {
  const user = Cookies.get("user");
  const parsed = user ? JSON.parse(user) : { role: "user" };
  const Layout = parsed.role === "admin" ? AdminLayout : UserLayout;

  // Ganti dengan URL FastAPI publik kamu (ngrok / domain)
  const FASTAPI_BASE = "https://dizygotic-ungruff-luke.ngrok-free.dev";

  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [polling, setPolling] = useState(true);
  const [lastSentHash, setLastSentHash] = useState(null);
  const [firebaseStatus, setFirebaseStatus] = useState({ sent: false, error: null });
  const [detectionHistory, setDetectionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

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

  // Send detection results to Firebase Realtime Database
  useEffect(() => {
    if (!result || !result.boxes || result.boxes.length === 0) return;
    
    // Create a hash of the detection data to avoid duplicate sends
    const detectionHash = JSON.stringify(
      result.boxes.map(b => ({
        xyxy: b.xyxy,
        class: b.class_name,
        confidence: b.confidence
      }))
    );
    
    // Only send if the detection data has changed
    if (lastSentHash === detectionHash) return;

    const timestamp = Date.now();
    const detectionsRef = ref(realtimedb, `detections/${timestamp}`);

    // Format detections according to database structure (array format)
    const formattedDetections = [];
    result.boxes.forEach((box) => {
      if (box.xyxy && box.xyxy.length >= 4) {
        const [x1, y1, x2, y2] = box.xyxy;
        formattedDetections.push({
          bbox: {
            x1: Math.round(x1),
            x2: Math.round(x2),
            y1: Math.round(y1),
            y2: Math.round(y2),
          },
          class: box.class_name || "unknown",
          confidence: box.confidence || 0,
        });
      }
    });

    // Only send if there are detections
    if (formattedDetections.length > 0) {
      console.log("Sending detections to Firebase:", {
        timestamp,
        count: formattedDetections.length,
        detections: formattedDetections
      });
      
      set(detectionsRef, formattedDetections)
        .then(() => {
          setLastSentHash(detectionHash);
          setFirebaseStatus({ sent: true, error: null });
          console.log("✅ Detection results sent to Firebase successfully:", {
            timestamp,
            path: `detections/${timestamp}`,
            count: formattedDetections.length
          });
          // Reset status setelah 3 detik
          setTimeout(() => setFirebaseStatus({ sent: false, error: null }), 3000);
        })
        .catch((err) => {
          console.error("❌ Error sending detection to Firebase:", err);
          setFirebaseStatus({ sent: false, error: err.message });
        });
    }
  }, [result, lastSentHash]);

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

  // Load detection history from Firebase
  useEffect(() => {
    const detRef = ref(realtimedb, "detections/");

    const unsub = onValue(detRef, (snapshot) => {
      if (!snapshot.exists()) {
        setDetectionHistory([]);
        return;
      }

      const data = snapshot.val();
      const detections = [];

      // Transform data structure: detections/{timestamp}/[] (array format)
      Object.keys(data).forEach((timestamp) => {
        const timestampData = data[timestamp];
        
        if (Array.isArray(timestampData)) {
          timestampData.forEach((detection, index) => {
            if (detection && detection.bbox && detection.class) {
              detections.push({
                timestamp: parseInt(timestamp),
                index: index,
                bbox: detection.bbox || {},
                class: detection.class || "unknown",
                confidence: detection.confidence || 0,
              });
            }
          });
        } else if (timestampData && typeof timestampData === 'object') {
          const keys = Object.keys(timestampData);
          const isNumericKeys = keys.every(key => !isNaN(parseInt(key)));
          
          if (isNumericKeys) {
            keys.sort((a, b) => parseInt(a) - parseInt(b)).forEach((index) => {
              const detection = timestampData[index];
              if (detection && detection.bbox && detection.class) {
                detections.push({
                  timestamp: parseInt(timestamp),
                  index: parseInt(index),
                  bbox: detection.bbox || {},
                  class: detection.class || "unknown",
                  confidence: detection.confidence || 0,
                });
              }
            });
          }
        }
      });

      // Sort by timestamp descending (newest first)
      detections.sort((a, b) => b.timestamp - a.timestamp);
      setDetectionHistory(detections);
    }, (error) => {
      console.error("Error reading detection history:", error);
    });

    return () => unsub();
  }, []);

  return (
    <Layout>
      <div className="p-3 md:p-6">
        <PageHeader
          title="Deteksi Kutu Putih"
          description="Streaming deteksi real-time dengan AI"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Streaming Card */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Camera className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Streaming</h2>
            </div>

            <div className="relative w-full bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden" style={{ minHeight: 360 }}>
              <img
                ref={imgRef}
                src={`${FASTAPI_BASE}/video`}
                alt="stream"
                className="w-full h-auto max-h-[640px] object-contain"
                style={{ display: "block" }}
                onError={() => setError("Gagal memuat stream. Cek URL / CORS / server")}
              />

              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 pointer-events-none"
                style={{ width: "100%", height: "100%" }}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                variant={polling ? "primary" : "outline"}
                size="sm"
                onClick={() => setPolling(true)}
              >
                Mulai Polling
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPolling(false)}
              >
                Stop Polling
              </Button>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Polling hasil dari endpoint /result
              </p>
            </div>
          </Card>

          {/* Hasil Deteksi Card */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Hasil Deteksi</h2>
              </div>
              {firebaseStatus.sent && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Tersimpan ke Firebase</span>
                </div>
              )}
              {firebaseStatus.error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <XCircle className="w-4 h-4" />
                  <span>Gagal menyimpan</span>
                </div>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {!result ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Menunggu hasil deteksi…
              </div>
            ) : (
              <div>
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Jumlah Terdeteksi</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result.count}</p>
                </div>

                {result.boxes && result.boxes.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Detail Deteksi:</p>
                    {result.boxes.map((b, i) => (
                      <div key={i} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-1">
                          <strong>{b.class_name}</strong> — {(b.confidence*100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Koordinat: [{b.xyxy.join(", ")}]
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    Tidak ada objek terdeteksi.
                  </div>
                )}

                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <div>Frame original: {result.frame_size?.w} x {result.frame_size?.h}</div>
                  <div>Timestamp: {new Date(result.timestamp).toLocaleString("id-ID")}</div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Riwayat Deteksi dari Firebase */}
        <Card className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Riwayat Deteksi dari Firebase
              </h2>
            </div>
            <Button
              variant={showHistory ? "primary" : "outline"}
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? "Sembunyikan" : "Tampilkan"} ({detectionHistory.length})
            </Button>
          </div>

          {showHistory && (
            <>
              {detectionHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Belum ada riwayat deteksi yang tersimpan
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHeaderCell>Waktu</TableHeaderCell>
                        <TableHeaderCell>Kelas</TableHeaderCell>
                        <TableHeaderCell>Confidence</TableHeaderCell>
                        <TableHeaderCell>Bounding Box</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detectionHistory.slice(0, 20).map((detection, idx) => (
                        <TableRow key={`${detection.timestamp}-${detection.index}-${idx}`}>
                          <TableCell>
                            {new Date(detection.timestamp).toLocaleString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-gray-800 dark:text-gray-100">
                              {detection.class}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-blue-600 dark:text-blue-400">
                              {(detection.confidence * 100).toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              x1:{detection.bbox.x1}, y1:{detection.bbox.y1}, x2:{detection.bbox.x2}, y2:{detection.bbox.y2}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {detectionHistory.length > 20 && (
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                  Menampilkan 20 dari {detectionHistory.length} hasil deteksi
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </Layout>
  );
}
