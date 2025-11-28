import UserLayout from "@/layouts/userlayout";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { Activity, Calendar, TrendingUp } from "lucide-react";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

import { getDatabase, ref, onValue } from "firebase/database";

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
      if (!snapshot.exists()) return;

      setRawDetections(Object.values(snapshot.val()));
    });
  };

  useEffect(() => {
    if (rawDetections.length === 0) return;

    const now = new Date();
    let filteredData = [];

    if (filterRange === "today") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      filteredData = rawDetections.filter((e) => e.timestamp >= start);
    } else if (filterRange === "yesterday") {
      const start = new Date(now);
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setHours(23, 59, 59, 999);

      filteredData = rawDetections.filter(
        (e) => e.timestamp >= start.getTime() && e.timestamp <= end.getTime()
      );
    } else if (filterRange === "week") {
      const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
      filteredData = rawDetections.filter((e) => e.timestamp >= weekAgo);
    } else {
      filteredData = rawDetections;
    }

    const chartData = filteredData.map((item) => ({
      time: new Date(item.timestamp).toLocaleString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "short",
      }),
      count: item.count,
    }));

    setFiltered(chartData);
  }, [filterRange, rawDetections]);

  const handleLogout = async () => {
    await fetch("/api/logout");
    Cookies.remove("user");
    router.push("/login");
  };


  const formatNumber = (num) => {
    return new Intl.NumberFormat("id-ID").format(num);
  };

  const todayCount = rawDetections.filter((e) => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    return e.timestamp >= start;
  }).length;

  const weekCount = rawDetections.filter((e) => e.timestamp >= Date.now() - 7 * 24 * 3600 * 1000).length;

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
            value={formatNumber(rawDetections.length)}
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
