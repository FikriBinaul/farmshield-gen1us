import LandingHeader from "@/components/LandingHeader";
import { useRouter } from "next/router";
import { FileText, Download, ExternalLink } from "lucide-react";
import { useState } from "react";

export default function Tatatulis() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // File PDF dari folder tatul
  const tatulFiles = [
    {
      name: "Jurnal JITET - Kelompok 1 Gen1us",
      path: "/tatul/Jurnal JITET_Kelompok 1 Gen1us_Belum fiks.pdf",
    },
  ];

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      <LandingHeader />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 pt-24">
        <div className="text-center mb-12">
          <FileText className="mx-auto mb-4 text-green-700" size={64} />
          <h1 className="text-5xl font-extrabold text-green-800 mb-4">Tatatulis</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Dokumentasi dan panduan penggunaan sistem FarmShield
          </p>
        </div>

        {/* File PDF dari folder tatul */}
        <div className="space-y-8">
          {tatulFiles.map((file, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText size={32} />
                    <div>
                      <h2 className="text-2xl font-bold">{file.name}</h2>
                      <p className="text-green-100 text-sm mt-1">Dokumen PDF</p>
                    </div>
                  </div>
                  <a
                    href={file.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    <Download size={20} />
                    <span>Download</span>
                  </a>
                </div>
              </div>

              <div className="p-4 bg-gray-100">
                <div className="relative w-full" style={{ minHeight: "800px" }}>
                  <iframe
                    src={`${file.path}#toolbar=1&navpanes=1&scrollbar=1`}
                    className="w-full h-full border-0 rounded-lg"
                    style={{ minHeight: "800px" }}
                    onLoad={() => setLoading(false)}
                  />
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                      <div className="text-center">
                        <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-600">Memuat dokumen...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

