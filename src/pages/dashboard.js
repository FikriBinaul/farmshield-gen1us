import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { db } from "@/lib/firebase";
import AdminLayout from "@/layouts/adminlayout";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
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
    const q = query(collection(db, "detections"), orderBy("timestamp", "asc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => d.data());

      // total
      const total = data.length;

      // today
      const today = data.filter((d) => {
        const t = d.timestamp.toDate();
        return (
          t.toDateString() === new Date().toDateString()
        );
      }).length;

      // accuracy
      const accuracy =
        data.length > 0
          ? (
              (data.filter((d) => d.result === "kutu_putih").length /
                data.length) *
              100
            ).toFixed(1)
          : 0;

      setStats({ total, today, accuracy });

      generateChart(data);
    });

    return () => unsub();
  }, [filter]);

  // =====================================
  // CHART DATA GENERATOR
  // =====================================
  const generateChart = (data) => {
    const grouped = {};

    data.forEach((d) => {
      const date = d.timestamp.toDate();

      let key;

      if (filter === "day") {
        key = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      } else if (filter === "week") {
        key = date.toLocaleDateString();
      } else {
        key = `${date.getMonth() + 1}/${date.getFullYear()}`;
      }

      if (!grouped[key]) grouped[key] = 0;
      grouped[key]++;
    });

    const chartArr = Object.entries(grouped).map(([k, v]) => ({
      label: k,
      value: v,
    }));

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

      </div>
    </AdminLayout>
  );
}
