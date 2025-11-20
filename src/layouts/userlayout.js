import Sidebar from "@/components/sidebar";
import Footer from "@/components/footer";
import Header from "@/components/header";
import LeafAnimation from '@/components/LeafAnimation';

export default function UserLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* Sidebar kiri */}
      <Sidebar role="user" />

      {/* Konten utama (header + content + footer) */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <Header />

        {/* Konten halaman */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
          <LeafAnimation />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
