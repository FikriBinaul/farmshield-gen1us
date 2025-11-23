import { useEffect, useRef, useState } from "react";
import AdminLayout from "@/layouts/adminlayout";
import UserLayout from "@/layouts/userlayout";
import Cookies from "js-cookie";
import { getActiveConfig } from "@/lib/apiConfig";

export default function Deteksi() {
  const user = Cookies.get("user");
  const parsed = user ? JSON.parse(user) : { role: "user" };
  const Layout = parsed.role === "admin" ? AdminLayout : UserLayout;

  // ---------- STATES ----------
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiConfig = getActiveConfig();

  // ---------- OPEN CAMERA ----------
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = stream;
      setIsCameraOn(true);
    } catch (err) {
      alert("Gagal membuka kamera!");
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
    }
    setIsCameraOn(false);
  };

  // ---------- CONVERT IMAGE TO BASE64 ----------
  const imageToBase64 = (canvas) => {
    return canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
  };

  // ---------- DETECT USING GROK API ----------
  const detectWithGrok = async (imageBase64) => {
    const config = getActiveConfig();
    
    if (!config.apiKey) {
      throw new Error("API Key tidak ditemukan. Silakan set NEXT_PUBLIC_GROK_API_KEY di .env.local");
    }

    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analisis gambar ini dan deteksi apakah ada kutu putih (whitefly/mealybug) pada tanaman. 
                Jika ada, berikan informasi:
                1. Jumlah kutu putih yang terdeteksi
                2. Lokasi setiap kutu (koordinat bounding box: x1, y1, x2, y2)
                3. Tingkat kepercayaan (confidence) untuk setiap deteksi
                
                Format response JSON:
                {
                  "count": jumlah_kutu,
                  "boxes": [
                    {
                      "xyxy": [x1, y1, x2, y2],
                      "class_name": "whitefly" atau "mealybug",
                      "confidence": 0.0-1.0
                    }
                  ]
                }
                
                Jika tidak ada kutu putih, return: {"count": 0, "boxes": []}`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: config.maxTokens,
        temperature: config.temperature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse response dari Grok
    const content = data.choices?.[0]?.message?.content || "";
    
    // Extract JSON dari response (bisa berupa markdown code block atau plain JSON)
    let jsonStr = content.trim();
    if (jsonStr.includes("```json")) {
      jsonStr = jsonStr.split("```json")[1].split("```")[0].trim();
    } else if (jsonStr.includes("```")) {
      jsonStr = jsonStr.split("```")[1].split("```")[0].trim();
    }
    
    try {
      const result = JSON.parse(jsonStr);
      return result;
    } catch (e) {
      // Jika parsing gagal, coba extract dengan regex
      const countMatch = content.match(/count["\s:]+(\d+)/i);
      const count = countMatch ? parseInt(countMatch[1]) : 0;
      
      return {
        count: count,
        boxes: [],
        rawResponse: content, // Simpan raw response untuk debugging
      };
    }
  };

  // ---------- DETECT USING CUSTOM API (FastAPI) ----------
  const detectWithCustom = async (blob) => {
    const config = getActiveConfig();
    const formData = new FormData();
    formData.append("file", blob, "frame.jpg");

    const response = await fetch(config.endpoint, {
      method: config.method || "POST",
      headers: config.headers || {},
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  };

  // ---------- MAIN DETECTION FUNCTION ----------
  const detectFrame = async () => {
    if (!videoRef.current) return;

    setLoading(true);
    setError(null);

    try {
      // Ambil frame video → convert ke canvas
      const canvas = document.createElement("canvas");
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      let detectionResult;
      const apiConfig = getActiveConfig();

      // Pilih metode berdasarkan provider
      if (apiConfig.provider === 'grok' || apiConfig.provider === 'openai') {
        // Gunakan Grok/OpenAI API dengan vision
        const imageBase64 = imageToBase64(canvas);
        detectionResult = await detectWithGrok(imageBase64);
      } else {
        // Gunakan Custom API (FastAPI)
        const blob = await new Promise((res) =>
          canvas.toBlob(res, "image/jpeg", 0.8)
        );
        detectionResult = await detectWithCustom(blob);
      }

      setResult(detectionResult);
      drawResult(detectionResult);
    } catch (err) {
      console.error("Detection error:", err);
      setError(err.message || "Gagal melakukan deteksi");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // ---------- DRAW BOUNDING BOXES ----------
  const drawResult = (data) => {
    if (!canvasRef.current || !videoRef.current || !data?.boxes) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw bounding boxes
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.font = "18px Arial";
    ctx.fillStyle = "yellow";

    data.boxes.forEach((box) => {
      if (box.xyxy && Array.isArray(box.xyxy) && box.xyxy.length >= 4) {
        const [x1, y1, x2, y2] = box.xyxy;
        const width = x2 - x1;
        const height = y2 - y1;
        
        // Draw rectangle
        ctx.strokeRect(x1, y1, width, height);
        
        // Draw label
        const label = `${box.class_name || "pest"} (${((box.confidence || 0) * 100).toFixed(1)}%)`;
        ctx.fillText(label, x1, Math.max(y1 - 5, 15));
      }
    });
  };

  useEffect(() => {
    let interval;
    if (detecting && !loading) {
      // Interval lebih lama untuk API calls (2 detik untuk Grok, bisa disesuaikan)
      const apiConfig = getActiveConfig();
      const intervalTime = apiConfig.provider === 'custom' ? 400 : 2000;
      interval = setInterval(() => {
        detectFrame();
      }, intervalTime);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [detecting, loading]);

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-200">Deteksi Kutu Putih 🐛</h1>
      <p className="text-gray-700 dark:text-gray-300 mb-6">
        Deteksi kutu putih secara real-time menggunakan kamera.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ---------- LEFT SIDE: CAMERA ---------- */}
        <div className="border border-gray-200 dark:border-gray-700 p-4 rounded shadow bg-white dark:bg-gray-800">
          <h2 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-200">📷 Kamera</h2>

          <video
            ref={videoRef}
            autoPlay
            className="w-full border border-gray-300 dark:border-gray-600 rounded"
          />

          <canvas
            ref={canvasRef}
            className="w-full border border-gray-300 dark:border-gray-600 rounded mt-3"
          />

          {!isCameraOn ? (
            <button
              onClick={startCamera}
              className="mt-4 bg-green-700 text-white px-4 py-2 rounded"
            >
              Buka Kamera
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
            >
              Matikan Kamera
            </button>
          )}

          {isCameraOn && (
            <button
              onClick={() => setDetecting((p) => !p)}
              disabled={loading}
              className={`mt-4 ml-2 px-4 py-2 rounded text-white transition ${
                loading 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : detecting 
                  ? "bg-red-600 hover:bg-red-700" 
                  : "bg-blue-700 hover:bg-blue-800"
              }`}
            >
              {loading ? "Memproses..." : detecting ? "Stop Deteksi" : "Mulai Deteksi"}
            </button>
          )}
        </div>

        {/* ---------- RIGHT SIDE: RESULT PANEL ---------- */}
        <div className="border border-gray-200 dark:border-gray-700 p-4 rounded shadow bg-white dark:bg-gray-800">
          <h2 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">📊 Hasil Deteksi</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Menganalisis gambar...</p>
            </div>
          )}

          {result && !loading ? (
            <div>
              <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Jumlah terdeteksi:{" "}
                <span className="text-red-600 dark:text-red-400">{result.count || 0}</span>
              </p>

              {result.boxes && result.boxes.length > 0 ? (
                <div className="mt-4 max-h-80 overflow-auto border border-gray-300 dark:border-gray-600 p-2 rounded bg-gray-50 dark:bg-gray-900">
                  {result.boxes.map((b, i) => (
                    <p key={i} className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                      • {b.class_name || "Pest"} ({(b.confidence ? (b.confidence * 100).toFixed(1) : 0)}%)
                    </p>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-gray-600 dark:text-gray-400">Tidak ada kutu putih terdeteksi.</p>
              )}

              {result.rawResponse && (
                <details className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  <summary className="cursor-pointer">Raw Response (Debug)</summary>
                  <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded overflow-auto max-h-40">
                    {result.rawResponse}
                  </pre>
                </details>
              )}
            </div>
          ) : !loading && !error ? (
            <p className="text-gray-500 dark:text-gray-400">Belum ada deteksi.</p>
          ) : null}
        </div>
      </div>
    </Layout>
  );
}
