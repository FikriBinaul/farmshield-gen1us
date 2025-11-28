"use client";

import { useEffect, useState } from "react";

export default function IndonesiaMap({ regionData, selectedRegion, onRegionClick }) {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leafletModules, setLeafletModules] = useState(null);

  // Koordinat pusat Indonesia dan zoom level
  const center = [-2.5, 118.0];
  const zoom = 5;

  // Koordinat provinsi di Indonesia (lat, lng)
  const provinceCoordinates = {
    "Jawa Barat": [-6.9175, 107.6191],
    "Jawa Tengah": [-7.0245, 110.1875],
    "Jawa Timur": [-7.5361, 112.2384],
    "Sumatera Utara": [3.5952, 98.6722],
    "Sumatera Selatan": [-3.3194, 103.9144],
    "Sulawesi Selatan": [-5.1477, 119.4327],
    "Bali": [-8.3405, 115.0920],
  };

  // Load Leaflet modules dan fix icon
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // Import semua modul sekaligus
        const reactLeaflet = await import("react-leaflet");
        const L = await import("leaflet");

        // Fix icon marker
        if (L.default?.Icon?.Default) {
          delete L.default.Icon.Default.prototype._getIconUrl;
          L.default.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
          });
        }

        // Simpan ke window untuk akses global
        if (typeof window !== "undefined") {
          window.L = L.default;
        }

        setLeafletModules({
          MapContainer: reactLeaflet.MapContainer,
          TileLayer: reactLeaflet.TileLayer,
          GeoJSON: reactLeaflet.GeoJSON,
          Marker: reactLeaflet.Marker,
          Popup: reactLeaflet.Popup,
          L: L.default,
        });
      } catch (err) {
        console.error("Error loading Leaflet:", err);
        setError("Gagal memuat library peta: " + err.message);
        setLoading(false);
      }
    };

    if (typeof window !== "undefined") {
      loadLeaflet();
    }
  }, []);

  // Load GeoJSON peta Indonesia dari API
  useEffect(() => {
    const loadGeoJSON = async () => {
      try {
        // Coba beberapa sumber GeoJSON
        const sources = [
          "https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia-province-simple.geojson",
          "https://raw.githubusercontent.com/ans-4175/peta-indonesia-geojson/master/indonesia.geojson",
        ];

        let data = null;
        for (const source of sources) {
          try {
            const response = await fetch(source);
            if (response.ok) {
              data = await response.json();
              break;
            }
          } catch (e) {
            continue;
          }
        }

        if (!data) {
          // Fallback: buat GeoJSON minimal
          data = {
            type: "FeatureCollection",
            features: [],
          };
        }

        setGeoJsonData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading GeoJSON:", error);
        setError("Gagal memuat data peta");
        setLoading(false);
      }
    };

    loadGeoJSON();
  }, []);

  // Styling untuk setiap feature (provinsi)
  const getStyle = (feature) => {
    const provinceName = feature?.properties?.name || feature?.properties?.NAME_1 || feature?.properties?.PROVINSI || "";
    const isSelected = Object.keys(regionData).some(
      (key) => key === provinceName || provinceName.includes(key) || key.includes(provinceName)
    );

    return {
      fillColor: isSelected ? "#10b981" : "#94a3b8",
      weight: 2,
      opacity: 1,
      color: "#ffffff",
      dashArray: "",
      fillOpacity: isSelected ? 0.7 : 0.3,
    };
  };

  // Event handler untuk klik pada provinsi
  const onEachFeature = (feature, layer) => {
    const provinceName = feature?.properties?.name || feature?.properties?.NAME_1 || feature?.properties?.PROVINSI || "";
    
    // Cari nama provinsi yang cocok dengan data kita
    const matchingRegion = Object.keys(regionData).find(
      (key) => key === provinceName || provinceName.includes(key) || key.includes(provinceName)
    );

    if (matchingRegion) {
      const data = regionData[matchingRegion];
      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 8px; color: #1f2937;">${matchingRegion}</h3>
          <div style="font-size: 12px; color: #4b5563;">
            <p><strong>Produksi:</strong> ${new Intl.NumberFormat("id-ID").format(data.produksi)} ton</p>
            <p><strong>Konsumsi:</strong> ${new Intl.NumberFormat("id-ID").format(data.konsumsi)} ton</p>
            <p><strong>Distribusi:</strong> ${new Intl.NumberFormat("id-ID").format(data.distribusi)} ton</p>
            <p><strong>Hasil Panen:</strong> ${new Intl.NumberFormat("id-ID").format(data.hasilPanen)} kg/ha</p>
          </div>
        </div>
      `;

      layer.bindPopup(popupContent);
      
      layer.on({
        click: () => {
          if (onRegionClick) {
            onRegionClick(matchingRegion);
          }
        },
        mouseover: (e) => {
          const layer = e.target;
          layer.setStyle({
            weight: 4,
            fillOpacity: 0.9,
            color: "#10b981",
          });
        },
        mouseout: (e) => {
          const layer = e.target;
          const style = getStyle(feature);
          layer.setStyle(style);
        },
      });
    }
  };

  // Loading state - hanya menunggu leaflet modules, GeoJSON bisa load kemudian
  if (!leafletModules) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-lg">
        <div className="text-center">
          <div className="text-gray-600 dark:text-gray-400 mb-2">Memuat peta Indonesia...</div>
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-lg">
        <div className="text-red-600 text-center p-4">
          <p className="font-semibold mb-2">{error}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Silakan refresh halaman atau coba lagi nanti.</p>
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, GeoJSON, Marker, Popup } = leafletModules;

  return (
    <div className="w-full h-full rounded-lg overflow-hidden relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Render GeoJSON peta Indonesia */}
        {geoJsonData && geoJsonData.features && geoJsonData.features.length > 0 && (
          <GeoJSON
            data={geoJsonData}
            style={getStyle}
            onEachFeature={onEachFeature}
          />
        )}

        {/* Render marker untuk setiap daerah dengan data */}
        {Object.entries(regionData).map(([region, data]) => {
          const coords = provinceCoordinates[region];
          if (!coords) return null;

          const isSelected = selectedRegion === region;
          
          // Create custom icon
          const customIcon = window.L?.divIcon({
            className: "custom-marker",
            html: `
              <div style="
                width: ${isSelected ? 32 : 28}px;
                height: ${isSelected ? 32 : 28}px;
                border-radius: 50%;
                background-color: ${isSelected ? "#ef4444" : "#10b981"};
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
              ">
                <div style="
                  width: ${(isSelected ? 32 : 28) * 0.4}px;
                  height: ${(isSelected ? 32 : 28) * 0.4}px;
                  border-radius: 50%;
                  background-color: white;
                "></div>
              </div>
            `,
            iconSize: [isSelected ? 32 : 28, isSelected ? 32 : 28],
            iconAnchor: [isSelected ? 16 : 14, isSelected ? 32 : 28],
            popupAnchor: [0, isSelected ? -32 : -28],
          });

          return (
            <Marker
              key={region}
              position={coords}
              icon={customIcon}
              eventHandlers={{
                click: () => {
                  if (onRegionClick) {
                    onRegionClick(region);
                  }
                },
              }}
            >
              <Popup>
                <div style={{ minWidth: "200px" }}>
                  <h3 style={{ fontWeight: "bold", marginBottom: "8px", color: "#1f2937" }}>
                    {region}
                  </h3>
                  <div style={{ fontSize: "12px", color: "#4b5563" }}>
                    <p>
                      <strong>Produksi:</strong> {new Intl.NumberFormat("id-ID").format(data.produksi)} ton
                    </p>
                    <p>
                      <strong>Konsumsi:</strong> {new Intl.NumberFormat("id-ID").format(data.konsumsi)} ton
                    </p>
                    <p>
                      <strong>Distribusi:</strong> {new Intl.NumberFormat("id-ID").format(data.distribusi)} ton
                    </p>
                    <p>
                      <strong>Hasil Panen:</strong> {new Intl.NumberFormat("id-ID").format(data.hasilPanen)} kg/ha
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

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
  );
}
