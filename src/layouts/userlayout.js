import Sidebar from "@/components/sidebar";
import Footer from "@/components/footer";
import Header from "@/components/header";
import LeafAnimation from '@/components/LeafAnimation';
import { useSidebar } from "@/contexts/SidebarContext";
import { useEffect, useState } from "react";

export default function UserLayout({ children }) {
  const { open } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">

      {/* Sidebar kiri */}
      <Sidebar role="user" />

      {/* Konten utama (header + content + footer) */}
      <div 
        className="flex-1 flex flex-col transition-all duration-300"
        style={{
          marginLeft: isMobile ? '0px' : (open ? '256px' : '80px')
        }}
      >

        {/* Header */}
        <Header />

        {/* Konten halaman */}
        <main className="flex-1 p-6 overflow-y-auto relative z-10 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
          {children}
          <LeafAnimation />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
