"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Import Leaflet CSS
if (typeof window !== "undefined") {
  require("leaflet/dist/leaflet.css");
}

// Dynamic import untuk Leaflet (client-side only)
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const GeoJSON = dynamic(() => import("react-leaflet").then(mod => mod.GeoJSON), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

export default function IndonesiaMap({ regionData, selectedRegion, onRegionClick }) {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapRef = useRef(null);

  // Koordinat pusat Indonesia dan zoom level
  const center = [-2.5, 118.0];
  const zoom = 5;

  // Load Leaflet dan fix icon marker
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("leaflet").then((L) => {
        // Fix untuk icon marker default Leaflet
        delete L.default.Icon.Default.prototype._getIconUrl;
        L.default.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });
        // Simpan ke window untuk akses global
        window.L = L.default;
        setLeafletLoaded(true);
      });
    }
  }, []);

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

  // Load GeoJSON peta Indonesia dari API
  useEffect(() => {
    const loadGeoJSON = async () => {
      try {
        // Menggunakan API GeoJSON Indonesia dari CDN
        const response = await fetch("https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia-province-simple.geojson");
        
        if (!response.ok) {
          throw new Error("Failed to fetch GeoJSON");
        }
        
        const data = await response.json();
        setGeoJsonData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading GeoJSON:", error);
        // Fallback: buat GeoJSON sederhana jika API gagal
        setGeoJsonData({
          type: "FeatureCollection",
          features: [],
        });
        setLoading(false);
      }
    };

    loadGeoJSON();
  }, []);

  // Styling untuk setiap feature (provinsi)
  const getStyle = (feature) => {
    const provinceName = feature?.properties?.name || feature?.properties?.NAME_1 || "";
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
    const provinceName = feature?.properties?.name || feature?.properties?.NAME_1 || "";
    
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

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-lg">
        <div className="text-gray-600 dark:text-gray-400">Memuat peta Indonesia...</div>
      </div>
    );
  }

  if (!geoJsonData) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-lg">
        <div className="text-red-600">Gagal memuat peta. Silakan refresh halaman.</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Render GeoJSON peta Indonesia */}
        {geoJsonData && (
          <GeoJSON
            data={geoJsonData}
            style={getStyle}
            onEachFeature={onEachFeature}
          />
        )}

        {/* Render marker untuk setiap daerah dengan data */}
        {leafletLoaded && Object.entries(regionData).map(([region, data]) => {
          const coords = provinceCoordinates[region];
          if (!coords) return null;

          const isSelected = selectedRegion === region;
          
          // Use divIcon for custom markers
          const createDivIcon = () => {
            if (typeof window === "undefined" || !window.L) return null;
            
            const color = isSelected ? "#ef4444" : "#10b981";
            const size = isSelected ? 32 : 28;
            
            return window.L.divIcon({
              className: "custom-marker",
              html: `
                <div style="
                  width: ${size}px;
                  height: ${size}px;
                  border-radius: 50%;
                  background-color: ${color};
                  border: 3px solid white;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  cursor: pointer;
                ">
                  <div style="
                    width: ${size * 0.4}px;
                    height: ${size * 0.4}px;
                    border-radius: 50%;
                    background-color: white;
                  "></div>
                </div>
              `,
              iconSize: [size, size],
              iconAnchor: [size / 2, size],
              popupAnchor: [0, -size],
            });
          };

          const customIcon = createDivIcon();
          if (!customIcon) return null;

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
    </div>
  );
}

