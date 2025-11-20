import Sidebar from "@/components/sidebar";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Search } from "lucide-react";
import { useSidebar } from "@/contexts/SidebarContext";
import LeafAnimation from '@/components/LeafAnimation';

export default function adminlayout({ children }) {
  const { open } = useSidebar();
  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* Sidebar kiri */}
      <Sidebar role="admin" />

      {/* Konten utama (header + content + footer) */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <Header />

        {/* Konten halaman */}
        <main className="flex-1 p-6 overflow-y-auto">
          <LeafAnimation />
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
