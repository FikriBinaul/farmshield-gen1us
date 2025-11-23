import UserLayout from "@/layouts/userlayout";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

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


  return (
    <UserLayout>
      <div className="p-8">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-1">Dashboard Pengguna</h1>
          <p className="text-gray-600">Selamat datang, {data?.name || user?.name || "Pengguna"}</p>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          <div className="bg-white shadow rounded-xl p-6 border">
            <p className="text-gray-500 text-sm">Total Deteksi Hari Ini</p>
            <h2 className="text-3xl font-bold mt-1">
              {
                rawDetections.filter((e) => {
                  const today = new Date();
                  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
                  return e.timestamp >= start;
                }).length
              }
            </h2>
          </div>

          <div className="bg-white shadow rounded-xl p-6 border">
            <p className="text-gray-500 text-sm">Total Deteksi Minggu Ini</p>
            <h2 className="text-3xl font-bold mt-1">
              {
                rawDetections.filter((e) => e.timestamp >= Date.now() - 7 * 24 * 3600 * 1000)
                  .length
              }
            </h2>
          </div>

          <div className="bg-white shadow rounded-xl p-6 border">
            <p className="text-gray-500 text-sm">Total Semua Deteksi</p>
            <h2 className="text-3xl font-bold mt-1">{rawDetections.length}</h2>
          </div>

        </div>

        {/* FILTER BUTTONS */}
        <div className="flex gap-3 mb-4">
          {["today", "yesterday", "week", "all"].map((range) => (
            <button
              key={range}
              onClick={() => setFilterRange(range)}
              className={`px-4 py-2 rounded-md font-medium capitalize ${
                filterRange === range
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {range === "today"
                ? "Hari Ini"
                : range === "yesterday"
                ? "Kemarin"
                : range === "week"
                ? "7 Hari"
                : "Semua"}
            </button>
          ))}
        </div>

        {/* GRAPH */}
        <div className="bg-white shadow rounded-xl border p-6 h-96 mb-16">
          <h3 className="text-lg font-semibold mb-4">Grafik Deteksi</h3>
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

        {/* LOGOUT */}
        <div className="mt-4">
          <button
            onClick={handleLogout}
            className="bg-red-600 px-4 py-2 text-white rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>

      </div>
    </UserLayout>
  );
}
