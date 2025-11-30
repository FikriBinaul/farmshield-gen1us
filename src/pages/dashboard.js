import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { realtimedb } from "@/lib/firebase";
import AdminLayout from "@/layouts/adminlayout";
import { ref, onValue } from "firebase/database";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Activity, Users, TrendingUp } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import Table, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from "@/components/ui/Table";

export const dynamic = "force-dynamic";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);


  // DETECTION STATS
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    accuracy: 0,
  });

  // GRAPH
  const [chartData, setChartData] = useState([]);
  const [filter, setFilter] = useState("week");
  const [detectionList, setDetectionList] = useState([]);

  // LOADING
  const [loading, setLoading] = useState(true);

  // =====================================
  // AUTH CHECK
  // =====================================
  useEffect(() => {
    const cookieUser = Cookies.get("user");
    if (!cookieUser) {
      router.push("/login");
      return;
    }

    try {
      const parsed = JSON.parse(cookieUser);
      setUser(parsed);

      if (parsed.role === "user") {
        router.push("/dashboard-user");
      }
    } catch (err) {
      Cookies.remove("user");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, []);


  // =====================================
  // REALTIME DETECTION LISTENER
  // =====================================
  useEffect(() => {
    const detRef = ref(realtimedb, "detections/");

    const unsub = onValue(detRef, (snapshot) => {
      if (!snapshot.exists()) {
        console.log("No detections found in Firebase (admin)");
        setDetectionList([]);
        setStats({ total: 0, today: 0, accuracy: 0 });
        setChartData([]);
        return;
      }

      const data = snapshot.val();
      console.log("Firebase data received (admin):", data);
      const detections = [];

      // Transform data structure: detections/{timestamp}/[] (array format)
      // Note: Firebase Realtime DB may convert arrays to objects with numeric keys
      Object.keys(data).forEach((timestamp) => {
        const timestampData = data[timestamp];
        
        // Check if it's an array
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
          // Handle object format (Firebase may convert arrays to objects)
          // Check if keys are numeric (indicating it was an array)
          const keys = Object.keys(timestampData);
          const isNumericKeys = keys.every(key => !isNaN(parseInt(key)));
          
          if (isNumericKeys) {
            // It's an array that was converted to object
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
          } else {
            // It's a regular object (old format)
            keys.forEach((index) => {
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
      console.log(`Processed ${detections.length} detections (admin)`);
      setDetectionList(detections);

      // Calculate stats
      const total = detections.length;

      const today = detections.filter((d) => {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        return d.timestamp >= start;
      }).length;

      // Calculate accuracy based on whitefly detections
      const whiteflyCount = detections.filter((d) => 
        d.class.toLowerCase().includes("whitefly") || 
        d.class.toLowerCase().includes("kutu") ||
        d.class.toLowerCase().includes("putih")
      ).length;

      const accuracy = total > 0 ? ((whiteflyCount / total) * 100).toFixed(1) : 0;

      setStats({ total, today, accuracy: parseFloat(accuracy) });

      generateChart(detections);
    });

    return () => unsub();
  }, [filter]);

  // Debug: log detection list changes
  useEffect(() => {
    console.log("Detection list updated (admin):", detectionList.length, "items");
  }, [detectionList]);

  // =====================================
  // CHART DATA GENERATOR
  // =====================================
  const generateChart = (data) => {
    const grouped = {};

    data.forEach((d) => {
      const date = new Date(d.timestamp);

      let key;

      if (filter === "day") {
        key = date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      } else if (filter === "week") {
        key = date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
      } else {
        key = `${date.getMonth() + 1}/${date.getFullYear()}`;
      }

      if (!grouped[key]) grouped[key] = 0;
      grouped[key]++;
    });

    const chartArr = Object.entries(grouped)
      .map(([k, v]) => ({
        label: k,
        value: v,
      }))
      .sort((a, b) => {
        // Sort by date for better visualization
        if (filter === "day" || filter === "week") {
          return new Date(a.label) - new Date(b.label);
        }
        return a.label.localeCompare(b.label);
      });

    setChartData(chartArr);
  };


  const handleLogout = async () => {
    await fetch("/api/logout");
    Cookies.remove("user");
    router.push("/login");
  };



  const formatNumber = (num) => {
    return new Intl.NumberFormat("id-ID").format(num);
  };

  return (
    <AdminLayout>
      <div className="p-3 md:p-6">
        {/* HEADER */}
        <PageHeader
          title="Admin Dashboard"
          description="Kelola pengguna dan pantau statistik deteksi kutu putih"
          action={
            <Button variant="danger" onClick={handleLogout}>
              Logout
            </Button>
          }
        />

        {/* STATISTICS CARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Deteksi"
            value={formatNumber(stats.total)}
            subtitle="Semua waktu"
            icon={Activity}
            iconColor="text-blue-600"
          />
          <StatCard
            title="Deteksi Hari Ini"
            value={formatNumber(stats.today)}
            subtitle="Hari ini"
            icon={TrendingUp}
            iconColor="text-green-600"
          />
          <StatCard
            title="Akurasi Kutu Putih"
            value={`${stats.accuracy}%`}
            subtitle="Tingkat akurasi"
            icon={Users}
            iconColor="text-purple-600"
          />
        </div>

        {/* CHART */}
        <Card className="mb-8">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
              Grafik Deteksi
            </h3>
            {/* FILTER GRAPH */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={filter === "day" ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter("day")}
              >
                Hari
              </Button>
              <Button
                variant={filter === "week" ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter("week")}
              >
                Minggu
              </Button>
              <Button
                variant={filter === "month" ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter("month")}
              >
                Bulan
              </Button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* DETECTION LIST TABLE */}
        <Card className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Daftar Hasil Deteksi
          </h3>
          {detectionList.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Belum ada hasil deteksi
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
                  {detectionList.slice(0, 50).map((detection, idx) => (
                    <TableRow key={`${detection.timestamp}-${detection.index}-${idx}`}>
                      <TableCell>
                        {new Date(detection.timestamp).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
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
          {detectionList.length > 50 && (
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
              Menampilkan 50 dari {detectionList.length} hasil deteksi
            </div>
          )}
        </Card>

      </div>
    </AdminLayout>
  );
}
