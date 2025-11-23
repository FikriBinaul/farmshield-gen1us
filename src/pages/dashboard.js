import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { db } from "@/lib/firebase";
import AdminLayout from "@/layouts/adminlayout";
import {
  collection,
  getDocs,
  onSnapshot,
  deleteDoc,
  updateDoc,
  addDoc,
  doc,
  query,
  orderBy,
  where,
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

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  // USER LIST
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });

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
  // LOAD LIST USERS
  // =====================================
  const loadUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    setUsers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

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

  // =====================================
  // CRUD USERS
  // =====================================
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password)
      return alert("Lengkapi semua field!");

    await addDoc(collection(db, "users"), {
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      createdAt: new Date(),
    });

    setNewUser({ name: "", email: "", password: "" });
    loadUsers();
  };

  const handleEdit = async (id) => {
    const newName = prompt("Masukkan nama baru:");
    if (!newName) return;
    await updateDoc(doc(db, "users", id), { name: newName });
    loadUsers();
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin mau hapus user ini?")) return;
    await deleteDoc(doc(db, "users", id));
    loadUsers();
  };

  const handleLogout = async () => {
    await fetch("/api/logout");
    Cookies.remove("user");
    router.push("/login");
  };

  useEffect(() => {
    loadUsers();
  }, []);


  return (
    <AdminLayout>
      <div className="p-8">

        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* STATISTICS CARD */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-white shadow rounded">
            <p>Total Deteksi</p>
            <h2 className="text-3xl font-bold">{stats.total}</h2>
          </div>

          <div className="p-4 bg-white shadow rounded">
            <p>Deteksi Hari Ini</p>
            <h2 className="text-3xl font-bold">{stats.today}</h2>
          </div>

          <div className="p-4 bg-white shadow rounded">
            <p>Akurasi Kutu Putih</p>
            <h2 className="text-3xl font-bold">{stats.accuracy}%</h2>
          </div>
        </div>

        {/* FILTER GRAPH */}
        <div className="flex gap-4 mb-4">
          <button onClick={() => setFilter("day")} className="bg-blue-500 text-white px-3 py-1 rounded">
            Hari
          </button>
          <button onClick={() => setFilter("week")} className="bg-blue-500 text-white px-3 py-1 rounded">
            Minggu
          </button>
          <button onClick={() => setFilter("month")} className="bg-blue-500 text-white px-3 py-1 rounded">
            Bulan
          </button>
        </div>

        {/* CHART */}
        <div className="bg-white shadow p-4 rounded mb-10">
          <h2 className="text-xl mb-3 font-bold">Grafik Deteksi</h2>
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
        </div>

        {/* USER TABLE */}
        <h2 className="text-xl font-bold mb-3">Kelola User</h2>
        
        <form onSubmit={handleCreate} className="mb-6 flex gap-3">
          <input type="text" placeholder="Nama" className="border p-2 rounded w-40"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
          <input type="email" placeholder="Email" className="border p-2 rounded w-56"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <input type="password" placeholder="Password" className="border p-2 rounded w-40"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
          <button className="bg-green-600 text-white px-4 rounded">
            Tambah User
          </button>
        </form>

        <table className="border w-full text-left">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="p-2">Nama</th>
              <th className="p-2">Email</th>
              <th className="p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => handleEdit(u.id)} className="bg-yellow-400 px-2 py-1 rounded">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(u.id)} className="bg-red-500 text-white px-2 py-1 rounded">
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </AdminLayout>
  );
}
