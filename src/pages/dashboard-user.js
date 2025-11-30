import UserLayout from "@/layouts/userlayout";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { Activity, Calendar, TrendingUp } from "lucide-react";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

import { getDatabase, ref, onValue } from "firebase/database";
import Table, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from "@/components/ui/Table";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

export default function DashboardUser() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);

  const [rawDetections, setRawDetections] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterRange, setFilterRange] = useState("today");
  const [detectionList, setDetectionList] = useState([]);

  const realtimeDB = getDatabase();

  useEffect(() => {
    const cookieUser = Cookies.get("user");
    if (!cookieUser) return router.push("/login");

    try {
      const parsed = JSON.parse(cookieUser);
      setUser(parsed);

      if (parsed.role === "admin") router.push("/dashboard");
      else {
        loadUserData(parsed.email);
        listenDetections();
      }
    } catch {
      Cookies.remove("user");
      router.push("/login");
    }
  }, []);

  const loadUserData = async (email) => {
    const q = query(collection(db, "users"), where("email", "==", email));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) setData(snapshot.docs[0].data());
  };

  const listenDetections = () => {
    const detRef = ref(realtimeDB, "detections/");

    onValue(detRef, (snapshot) => {
      if (!snapshot.exists()) {
        setRawDetections([]);
        setDetectionList([]);
        return;
      }

      const data = snapshot.val();
      const detections = [];
      const flatDetections = [];

      // Transform data structure: detections/{timestamp}/[] (array format)
      Object.keys(data).forEach((timestamp) => {
        const timestampData = data[timestamp];
        // Check if it's an array
        if (Array.isArray(timestampData)) {
          timestampData.forEach((detection, index) => {
            if (detection) {
              const detectionItem = {
                timestamp: parseInt(timestamp),
                index: index,
                bbox: detection.bbox || {},
                class: detection.class || "unknown",
                confidence: detection.confidence || 0,
              };
              detections.push(detectionItem);
            }
          });
          flatDetections.push({
            timestamp: parseInt(timestamp),
            count: timestampData.length,
          });
        } else if (timestampData && typeof timestampData === 'object') {
          // Fallback: handle object format if needed
          Object.keys(timestampData).forEach((index) => {
            const detection = timestampData[index];
            if (detection) {
              const detectionItem = {
                timestamp: parseInt(timestamp),
                index: parseInt(index),
                bbox: detection.bbox || {},
                class: detection.class || "unknown",
                confidence: detection.confidence || 0,
              };
              detections.push(detectionItem);
            }
          });
          flatDetections.push({
            timestamp: parseInt(timestamp),
            count: Object.keys(timestampData).length,
          });
        }
      });

      // Sort by timestamp descending (newest first)
      detections.sort((a, b) => b.timestamp - a.timestamp);
      setDetectionList(detections);
      setRawDetections(flatDetections);
    });
  };

  useEffect(() => {
    if (detectionList.length === 0) return;

    const now = new Date();
    let filteredData = [];

    if (filterRange === "today") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      filteredData = detectionList.filter((e) => e.timestamp >= start);
    } else if (filterRange === "yesterday") {
      const start = new Date(now);
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setHours(23, 59, 59, 999);

      filteredData = detectionList.filter(
        (e) => e.timestamp >= start.getTime() && e.timestamp <= end.getTime()
      );
    } else if (filterRange === "week") {
      const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
      filteredData = detectionList.filter((e) => e.timestamp >= weekAgo);
    } else {
      filteredData = detectionList;
    }

    // Group by timestamp for chart
    const groupedByTimestamp = {};
    filteredData.forEach((item) => {
      const timeKey = new Date(item.timestamp).toLocaleString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "short",
      });
      if (!groupedByTimestamp[timeKey]) {
        groupedByTimestamp[timeKey] = 0;
      }
      groupedByTimestamp[timeKey]++;
    });

    const chartData = Object.entries(groupedByTimestamp).map(([time, count]) => ({
      time,
      count,
    }));

    setFiltered(chartData);
  }, [filterRange, detectionList]);

  const handleLogout = async () => {
    await fetch("/api/logout");
    Cookies.remove("user");
    router.push("/login");
  };


  const formatNumber = (num) => {
    return new Intl.NumberFormat("id-ID").format(num);
  };

  const todayCount = detectionList.filter((e) => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    return e.timestamp >= start;
  }).length;

  const weekCount = detectionList.filter((e) => e.timestamp >= Date.now() - 7 * 24 * 3600 * 1000).length;

  const totalDetections = detectionList.length;

  return (
    <UserLayout>
      <div className="p-3 md:p-6">
        {/* HEADER */}
        <PageHeader
          title="Dashboard Pengguna"
          description={`Selamat datang, ${data?.name || user?.name || "Pengguna"}`}
        />

        {/* QUICK STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Deteksi Hari Ini"
            value={formatNumber(todayCount)}
            subtitle="Hari ini"
            icon={Activity}
            iconColor="text-blue-600"
          />
          <StatCard
            title="Total Deteksi Minggu Ini"
            value={formatNumber(weekCount)}
            subtitle="7 hari terakhir"
            icon={Calendar}
            iconColor="text-green-600"
          />
          <StatCard
            title="Total Semua Deteksi"
            value={formatNumber(totalDetections)}
            subtitle="Semua waktu"
            icon={TrendingUp}
            iconColor="text-purple-600"
          />
        </div>

        {/* GRAPH */}
        <Card className="mb-8">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
              Grafik Deteksi
            </h3>
            {/* FILTER BUTTONS */}
            <div className="flex flex-wrap gap-2 mb-4">
              {["today", "yesterday", "week", "all"].map((range) => (
                <Button
                  key={range}
                  variant={filterRange === range ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setFilterRange(range)}
                >
                  {range === "today"
                    ? "Hari Ini"
                    : range === "yesterday"
                    ? "Kemarin"
                    : range === "week"
                    ? "7 Hari"
                    : "Semua"}
                </Button>
              ))}
            </div>
          </div>
          <div style={{ height: "400px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filtered}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
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

        {/* LOGOUT */}
        <div className="flex justify-end">
          <Button variant="danger" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </UserLayout>
  );
}
