export default function Footer() {
  return (
    <footer className="bg-green-900 text-gray-200 pt-12 mt-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Kolom 1 */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-3">FarmShield</h3>
          <p className="text-sm leading-relaxed opacity-90">
            Platform digital untuk meningkatkan produktivitas petani melalui edukasi, 
            forum diskusi, radio tani, dan berbagai fitur inovatif lainnya.
          </p>
        </div>

        {/* Kolom 2 */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Navigasi</h3>
          <ul className="space-y-2">
            <li><a href="/forum" className="hover:text-white hover:underline transition">Forum</a></li>
            <li><a href="/radio" className="hover:text-white hover:underline transition">Radio Petani</a></li>
            <li><a href="/ensiklopedia" className="hover:text-white hover:underline transition">Ensiklopedia</a></li>
            <li><a href="/akun" className="hover:text-white hover:underline transition">Akun</a></li>
          </ul>
        </div>

        {/* Kolom 3 */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Kontak</h3>
          <ul className="space-y-2 text-sm">
            <li>📍 Indonesia</li>
            <li>📧 support@farmshield.id</li>
            <li>📞 +62 812-3456-7890</li>
          </ul>
        </div>

      </div>

      {/* Garis Pembatas */}
      <div className="border-t border-green-700 mt-10"></div>

      {/* Footer Bottom */}
      <div className="text-center py-4 text-sm opacity-80">
        © {new Date().getFullYear()} <span className="font-semibold">FarmShield</span> – Semua Hak Dilindungi
      </div>
    </footer>
  );
}
