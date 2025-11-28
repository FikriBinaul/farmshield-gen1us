import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
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
import { MapPin, TrendingUp, Package, ShoppingCart, Leaf, FileText, ExternalLink } from "lucide-react";
import {
  regionData,
  konsumsiBulananData,
  distribusiSektorData,
  trenProduksiData,
  dataSources,
  informasiTambahan,
} from "@/data/agricultureData";

// Dynamic import untuk peta (client-side only)
const IndonesiaMap = dynamic(() => import("@/components/IndonesiaMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-lg">
      <div className="text-gray-600 dark:text-gray-400">Memuat peta...</div>
    </div>
  ),
});

export default function PetaStatistik() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSources, setShowSources] = useState(false);

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

  // Data konsumsi nasional (format untuk chart)
  const konsumsiData = konsumsiBulananData.map((item) => ({
    bulan: item.bulan.substring(0, 3), // ambil 3 karakter pertama
    konsumsi: item.konsumsi,
    fullName: item.bulan,
  }));

  // Data distribusi per sektor untuk pie chart
  const distribusiSektorChart = distribusiSektorData.map((item) => ({
    name: item.sektor,
    value: item.persentase,
    volume: item.volume,
  }));

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

  const totalProduksi = informasiTambahan.totalProduksi;
  const totalKonsumsi = informasiTambahan.totalKonsumsi;
  const totalDistribusi = informasiTambahan.totalDistribusi;

  return (
    <Layout>
      <div className="p-3 md:p-6">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Peta Statistik Pertanian Tomat
              </h1>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                Visualisasi data hasil panen, konsumsi, dan distribusi tomat per daerah di Indonesia
              </p>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-2">
                Data {informasiTambahan.periodeData} | Update: {informasiTambahan.updateTerakhir}
              </p>
            </div>
            <button
              onClick={() => setShowSources(!showSources)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors w-full md:w-auto"
            >
              <FileText className="w-4 h-4" />
              <span>Sumber Data</span>
            </button>
          </div>

          {/* Sumber Data Modal */}
          {showSources && (
            <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  Sumber Data
                </h3>
                <button
                  onClick={() => setShowSources(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm md:text-base text-gray-700 dark:text-gray-300 mb-2">Produksi</h4>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    <strong>Sumber:</strong> {dataSources.produksi.sumber}
                  </p>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    <strong>Publikasi:</strong> {dataSources.produksi.publikasi} ({dataSources.produksi.tahun})
                  </p>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    <strong>Catatan:</strong> {dataSources.produksi.catatan}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm md:text-base text-gray-700 dark:text-gray-300 mb-2">Konsumsi</h4>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    <strong>Sumber:</strong> {dataSources.konsumsi.sumber}
                  </p>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    <strong>Publikasi:</strong> {dataSources.konsumsi.publikasi} ({dataSources.konsumsi.tahun})
                  </p>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    <strong>Catatan:</strong> {dataSources.konsumsi.catatan}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm md:text-base text-gray-700 dark:text-gray-300 mb-2">Distribusi</h4>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    <strong>Sumber:</strong> {dataSources.distribusi.sumber}
                  </p>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    <strong>Publikasi:</strong> {dataSources.distribusi.publikasi} ({dataSources.distribusi.tahun})
                  </p>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    <strong>Catatan:</strong> {dataSources.distribusi.catatan}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm md:text-base text-gray-700 dark:text-gray-300 mb-2">Hasil Panen</h4>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    <strong>Sumber:</strong> {dataSources.hasilPanen.sumber}
                  </p>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    <strong>Publikasi:</strong> {dataSources.hasilPanen.publikasi} ({dataSources.hasilPanen.tahun})
                  </p>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    <strong>Catatan:</strong> {dataSources.hasilPanen.catatan}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Peta Indonesia dengan Leaflet */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-800 dark:text-gray-100">Peta Indonesia</h2>
            <div className="relative bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden h-[300px] md:h-[500px]">
              <IndonesiaMap
                regionData={regionData}
                selectedRegion={selectedRegion}
                onRegionClick={handleRegionClick}
              />
              
              {/* Legenda */}
              <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 z-[1000]">
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
              <div className="mt-3 md:mt-4 p-3 md:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2 text-sm md:text-base">
                  {selectedRegion}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-xs md:text-sm mb-3">
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
                    <p className="text-gray-600 dark:text-gray-400">Distribusi</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                      {formatNumber(regionData[selectedRegion].distribusi)} ton
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Hasil Panen</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                      {formatNumber(regionData[selectedRegion].hasilPanen)} kg/ha
                    </p>
                  </div>
                </div>
                {regionData[selectedRegion].sumber && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <strong>Sumber:</strong> {regionData[selectedRegion].sumber}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* List Daerah */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-800 dark:text-gray-100">Daftar Daerah</h2>
            <div className="space-y-2 md:space-y-3 max-h-[300px] md:max-h-[500px] overflow-y-auto">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
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

          {/* Chart Distribusi per Sektor */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
              Distribusi per Sektor
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distribusiSektorChart}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distribusiSektorChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [
                  `${value}% (${formatNumber(props.payload.volume)} ton)`,
                  name
                ]} />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Sumber: {distribusiSektorData[0]?.sumber}
            </p>
          </div>
        </div>

        {/* Chart Konsumsi Nasional */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700 mb-6 md:mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Tren Konsumsi Nasional per Bulan
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={konsumsiData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bulan" />
              <YAxis />
              <Tooltip 
                formatter={(value, name, props) => [
                  `${formatNumber(value)} ribu ton`,
                  `Konsumsi ${props.payload.fullName}`
                ]}
                labelFormatter={(label) => `Bulan: ${label}`}
              />
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
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Sumber: {konsumsiBulananData[0]?.sumber}
          </p>
        </div>

        {/* Chart Tren Produksi 5 Tahun */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700 mb-6 md:mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Tren Produksi dan Konsumsi 5 Tahun Terakhir
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trenProduksiData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tahun" />
              <YAxis />
              <Tooltip formatter={(value) => `${formatNumber(value)} ribu ton`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="produksi"
                stroke="#10b981"
                strokeWidth={3}
                name="Produksi (ribu ton)"
                dot={{ fill: "#10b981", r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="konsumsi"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Konsumsi (ribu ton)"
                dot={{ fill: "#3b82f6", r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Sumber: BPS - Statistik Pertanian 2019-2023
          </p>
        </div>

        {/* Tabel Detail */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-gray-800 dark:text-gray-100">
            Detail Statistik per Daerah
          </h3>
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <div className="inline-block min-w-full align-middle px-4 md:px-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-3 text-gray-700 dark:text-gray-300">Daerah</th>
                  <th className="text-right p-3 text-gray-700 dark:text-gray-300">Produksi (ton)</th>
                  <th className="text-right p-3 text-gray-700 dark:text-gray-300">Konsumsi (ton)</th>
                  <th className="text-right p-3 text-gray-700 dark:text-gray-300">Distribusi (ton)</th>
                  <th className="text-right p-3 text-gray-700 dark:text-gray-300">Hasil Panen (kg/ha)</th>
                  <th className="text-right p-3 text-gray-700 dark:text-gray-300">Luas Lahan (ha)</th>
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
                      <td className="p-3 text-right text-gray-700 dark:text-gray-300">
                        {formatNumber(data.luasLahan)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            </div>
          </div>
          <div className="mt-4 p-3 md:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300">
              <strong>Total Luas Lahan:</strong> {formatNumber(informasiTambahan.totalLuasLahan)} hektar
            </p>
            <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 mt-1">
              <strong>Rata-rata Hasil Panen:</strong> {formatNumber(informasiTambahan.rataRataHasilPanen)} kg/ha
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

