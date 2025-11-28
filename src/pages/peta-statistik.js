import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import UserLayout from "@/layouts/userlayout";
import AdminLayout from "@/layouts/adminlayout";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { MapPin, TrendingUp, Package, ShoppingCart, Leaf } from "lucide-react";

export default function PetaStatistik() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [loading, setLoading] = useState(true);

  // Data statistik per daerah (dummy data untuk demo)
  const regionData = {
    "Jawa Barat": {
      produksi: 450000,
      konsumsi: 380000,
      distribusi: 420000,
      hasilPanen: 12500,
      koordinat: { x: 52, y: 48 },
    },
    "Jawa Tengah": {
      produksi: 380000,
      konsumsi: 320000,
      distribusi: 360000,
      hasilPanen: 9800,
      koordinat: { x: 50, y: 52 },
    },
    "Jawa Timur": {
      produksi: 520000,
      konsumsi: 450000,
      distribusi: 480000,
      hasilPanen: 15200,
      koordinat: { x: 55, y: 52 },
    },
    "Sumatera Utara": {
      produksi: 280000,
      konsumsi: 240000,
      distribusi: 260000,
      hasilPanen: 7200,
      koordinat: { x: 48, y: 28 },
    },
    "Sumatera Selatan": {
      produksi: 220000,
      konsumsi: 190000,
      distribusi: 210000,
      hasilPanen: 5800,
      koordinat: { x: 52, y: 38 },
    },
    "Sulawesi Selatan": {
      produksi: 180000,
      konsumsi: 150000,
      distribusi: 170000,
      hasilPanen: 4200,
      koordinat: { x: 58, y: 48 },
    },
    "Bali": {
      produksi: 95000,
      konsumsi: 85000,
      distribusi: 90000,
      hasilPanen: 2800,
      koordinat: { x: 53, y: 56 },
    },
  };

  // Data untuk chart hasil panen per bulan
  const panenData = Object.entries(regionData).map(([region, data]) => ({
    name: region.split(" ")[region.split(" ").length - 1], // ambil kata terakhir
    produksi: data.produksi / 1000, // dalam ribuan ton
    konsumsi: data.konsumsi / 1000,
  }));

  // Data distribusi
  const distribusiData = Object.entries(regionData).map(([region, data]) => ({
    name: region,
    distribusi: data.distribusi / 1000,
    hasilPanen: data.hasilPanen,
  }));

  // Data konsumsi nasional
  const konsumsiData = [
    { bulan: "Jan", konsumsi: 320 },
    { bulan: "Feb", konsumsi: 340 },
    { bulan: "Mar", konsumsi: 380 },
    { bulan: "Apr", konsumsi: 420 },
    { bulan: "Mei", konsumsi: 450 },
    { bulan: "Jun", konsumsi: 480 },
    { bulan: "Jul", konsumsi: 520 },
    { bulan: "Agu", konsumsi: 560 },
    { bulan: "Sep", konsumsi: 540 },
    { bulan: "Okt", konsumsi: 500 },
    { bulan: "Nov", konsumsi: 460 },
    { bulan: "Des", konsumsi: 400 },
  ];

  // Warna untuk pie chart
  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

  useEffect(() => {
    const cookieUser = Cookies.get("user");
    if (!cookieUser) {
      router.push("/login");
      return;
    }

    try {
      const parsed = JSON.parse(cookieUser);
      setUser(parsed);
    } catch (err) {
      Cookies.remove("user");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Memuat data...</div>
      </div>
    );
  }

  const Layout = user?.role === "admin" ? AdminLayout : UserLayout;

  const handleRegionClick = (regionName) => {
    setSelectedRegion(regionName);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("id-ID").format(num);
  };

  const totalProduksi = Object.values(regionData).reduce((sum, r) => sum + r.produksi, 0);
  const totalKonsumsi = Object.values(regionData).reduce((sum, r) => sum + r.konsumsi, 0);
  const totalDistribusi = Object.values(regionData).reduce((sum, r) => sum + r.distribusi, 0);

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Peta Statistik Pertanian Tomat
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visualisasi data hasil panen, konsumsi, dan distribusi tomat per daerah di Indonesia
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Produksi</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                  {formatNumber(totalProduksi)}
                </h3>
                <p className="text-xs text-gray-500 mt-1">ton/tahun</p>
              </div>
              <Leaf className="text-green-600 w-10 h-10" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Konsumsi</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                  {formatNumber(totalKonsumsi)}
                </h3>
                <p className="text-xs text-gray-500 mt-1">ton/tahun</p>
              </div>
              <ShoppingCart className="text-blue-600 w-10 h-10" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Distribusi</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                  {formatNumber(totalDistribusi)}
                </h3>
                <p className="text-xs text-gray-500 mt-1">ton/tahun</p>
              </div>
              <Package className="text-orange-600 w-10 h-10" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Jumlah Daerah</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                  {Object.keys(regionData).length}
                </h3>
                <p className="text-xs text-gray-500 mt-1">provinsi</p>
              </div>
              <MapPin className="text-purple-600 w-10 h-10" />
            </div>
          </div>
        </div>

        {/* Peta dan Statistik Daerah */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Peta Indonesia Sederhana */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Peta Indonesia</h2>
            <div className="relative bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden" style={{ height: "500px" }}>
              {/* Peta sederhana dengan kotak-kotak representasi daerah */}
              <svg viewBox="0 0 120 80" className="w-full h-full" style={{ background: "linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 100%)" }}>
                {/* Background Indonesia */}
                <rect x="0" y="0" width="120" height="80" fill="rgba(16, 185, 129, 0.1)" />
                
                {/* Representasi Pulau-pulau */}
                {/* Sumatera */}
                <rect x="10" y="20" width="50" height="25" fill="#10b981" opacity="0.6" rx="2" />
                
                {/* Jawa */}
                <rect x="45" y="45" width="55" height="8" fill="#3b82f6" opacity="0.6" rx="1" />
                
                {/* Kalimantan */}
                <rect x="25" y="30" width="35" height="28" fill="#f59e0b" opacity="0.6" rx="2" />
                
                {/* Sulawesi */}
                <rect x="70" y="40" width="20" height="30" fill="#ef4444" opacity="0.6" rx="2" />
                
                {/* Papua */}
                <rect x="95" y="15" width="20" height="50" fill="#8b5cf6" opacity="0.6" rx="2" />
                
                {/* Marker untuk setiap daerah */}
                {Object.entries(regionData).map(([region, data]) => (
                  <g key={region}>
                    <circle
                      cx={data.koordinat.x}
                      cy={data.koordinat.y}
                      r={selectedRegion === region ? "4" : "3"}
                      fill={selectedRegion === region ? "#ef4444" : "#10b981"}
                      stroke="white"
                      strokeWidth="2"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleRegionClick(region)}
                      onMouseEnter={() => {}}
                      className="hover:r-4 transition-all"
                    />
                    {selectedRegion === region && (
                      <text
                        x={data.koordinat.x}
                        y={data.koordinat.y - 8}
                        textAnchor="middle"
                        fill="#1f2937"
                        fontSize="2"
                        fontWeight="bold"
                        className="pointer-events-none"
                      >
                        {region}
                      </text>
                    )}
                  </g>
                ))}
              </svg>

              {/* Legenda */}
              <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold mb-2 text-gray-800 dark:text-gray-100">Legenda</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Daerah Produksi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Daerah Terpilih</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Daerah yang Dipilih */}
            {selectedRegion && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                  {selectedRegion}
                </h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Produksi</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                      {formatNumber(regionData[selectedRegion].produksi)} ton
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Konsumsi</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                      {formatNumber(regionData[selectedRegion].konsumsi)} ton
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Hasil Panen</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                      {formatNumber(regionData[selectedRegion].hasilPanen)} kg/ha
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* List Daerah */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Daftar Daerah</h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {Object.entries(regionData)
                .sort((a, b) => b[1].produksi - a[1].produksi)
                .map(([region, data]) => (
                  <div
                    key={region}
                    onClick={() => handleRegionClick(region)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedRegion === region
                        ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                        : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:border-green-300"
                    }`}
                  >
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">{region}</h3>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Produksi: </span>
                        <span className="font-medium text-gray-800 dark:text-gray-100">
                          {formatNumber(data.produksi)} ton
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Panen: </span>
                        <span className="font-medium text-gray-800 dark:text-gray-100">
                          {formatNumber(data.hasilPanen)} kg/ha
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Chart Produksi vs Konsumsi */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
              Produksi vs Konsumsi per Daerah
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={panenData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="produksi" fill="#10b981" name="Produksi (ribu ton)" />
                <Bar dataKey="konsumsi" fill="#3b82f6" name="Konsumsi (ribu ton)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Distribusi */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
              Distribusi Hasil Panen
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distribusiData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name.split(" ").pop()}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="distribusi"
                >
                  {distribusiData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart Konsumsi Nasional */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Tren Konsumsi Nasional per Bulan
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={konsumsiData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bulan" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="konsumsi"
                stroke="#10b981"
                strokeWidth={3}
                name="Konsumsi (ribu ton)"
                dot={{ fill: "#10b981", r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tabel Detail */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Detail Statistik per Daerah
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-3 text-gray-700 dark:text-gray-300">Daerah</th>
                  <th className="text-right p-3 text-gray-700 dark:text-gray-300">Produksi (ton)</th>
                  <th className="text-right p-3 text-gray-700 dark:text-gray-300">Konsumsi (ton)</th>
                  <th className="text-right p-3 text-gray-700 dark:text-gray-300">Distribusi (ton)</th>
                  <th className="text-right p-3 text-gray-700 dark:text-gray-300">Hasil Panen (kg/ha)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(regionData)
                  .sort((a, b) => b[1].produksi - a[1].produksi)
                  .map(([region, data], index) => (
                    <tr
                      key={region}
                      className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                        selectedRegion === region ? "bg-green-50 dark:bg-green-900/20" : ""
                      }`}
                      onClick={() => handleRegionClick(region)}
                      style={{ cursor: "pointer" }}
                    >
                      <td className="p-3 font-medium text-gray-800 dark:text-gray-100">{region}</td>
                      <td className="p-3 text-right text-gray-700 dark:text-gray-300">
                        {formatNumber(data.produksi)}
                      </td>
                      <td className="p-3 text-right text-gray-700 dark:text-gray-300">
                        {formatNumber(data.konsumsi)}
                      </td>
                      <td className="p-3 text-right text-gray-700 dark:text-gray-300">
                        {formatNumber(data.distribusi)}
                      </td>
                      <td className="p-3 text-right text-gray-700 dark:text-gray-300">
                        {formatNumber(data.hasilPanen)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

