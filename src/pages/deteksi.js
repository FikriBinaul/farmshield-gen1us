import { useEffect, useRef, useState } from "react";
import AdminLayout from "@/layouts/adminlayout";
import UserLayout from "@/layouts/userlayout";
import Cookies from "js-cookie";

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

  const FASTAPI_URL = "http://localhost:8000/detect";

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

  // ---------- SEND FRAME TO PYTHON ----------
  const detectFrame = async () => {
    if (!videoRef.current) return;

    // Ambil frame video → convert ke blob
    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    const blob = await new Promise((res) =>
      canvas.toBlob(res, "image/jpeg", 0.8)
    );

    const formData = new FormData();
    formData.append("file", blob, "frame.jpg");

    const response = await fetch(FASTAPI_URL, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setResult(data);

    drawResult(data);
  };

  // ---------- DRAW BOUNDING BOXES ----------
  const drawResult = (data) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.font = "18px Arial";
    ctx.fillStyle = "yellow";

    data.boxes?.forEach((box) => {
      const [x1, y1, x2, y2] = box.xyxy;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      ctx.fillText(`${box.class_name} (${box.confidence.toFixed(2)})`, x1, y1 - 5);
    });
  };

  useEffect(() => {
    let interval;
    if (detecting) {
      interval = setInterval(detectFrame, 400); // real-time every 400ms
    }
    return () => clearInterval(interval);
  }, [detecting]);

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-4">Deteksi Kutu Putih 🐛</h1>
      <p className="text-gray-700 mb-6">
        Deteksi kutu putih secara real-time menggunakan kamera.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ---------- LEFT SIDE: CAMERA ---------- */}
        <div className="border p-4 rounded shadow bg-white">
          <h2 className="font-bold text-lg mb-2">📷 Kamera</h2>

          <video
            ref={videoRef}
            autoPlay
            className="w-full border rounded"
          />

          <canvas
            ref={canvasRef}
            className="w-full border rounded mt-3"
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
              className="mt-4 ml-2 bg-blue-700 text-white px-4 py-2 rounded"
            >
              {detecting ? "Stop Deteksi" : "Mulai Deteksi"}
            </button>
          )}
        </div>

        {/* ---------- RIGHT SIDE: RESULT PANEL ---------- */}
        <div className="border p-4 rounded shadow bg-white">
          <h2 className="font-bold text-lg mb-4">📊 Hasil Deteksi</h2>

          {result ? (
            <div>
              <p className="text-xl font-semibold">
                Jumlah terdeteksi:{" "}
                <span className="text-red-600">{result.count}</span>
              </p>

              <div className="mt-4 max-h-80 overflow-auto border p-2 rounded">
                {result.boxes.map((b, i) => (
                  <p key={i} className="text-sm">
                    • {b.class_name} ({(b.confidence * 100).toFixed(1)}%)
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Belum ada deteksi.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
