import { useState, useEffect } from "react";
import { Moon, Sun, Menu, X, Search } from "lucide-react";
import { useSidebar } from "@/contexts/SidebarContext";
import { useDarkMode } from "@/contexts/DarkModeContext";

export default function Header() {
  const { open, setOpen } = useSidebar();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleSidebar = () => setOpen(!open);

  return (
    <header className="w-full glass-navbar dark:text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">

        {/* Mobile Sidebar Toggle */}
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className="p-2 dark:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <Menu size={24} />
          </button>
        )}

        {/* Logo */}
        <div className="font-bold text-xl dark:text-white flex-1 text-center md:text-left">
          Farmshield
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6 items-center">
          <a href="/" className="hover:text-green-600 dark:hover:text-green-400 dark:text-gray-300">Home</a>
          <a href="/forum" className="hover:text-green-600 dark:hover:text-green-400 dark:text-gray-300">Forum</a>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="glass-input rounded-lg px-3 py-1.5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <Search className="absolute right-2 top-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>

          {/* Dark mode toggle */}
          <button onClick={toggleDarkMode} className="p-2 rounded-full glass-button hover:bg-white/20 dark:hover:bg-white/10 transition-all">
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2 dark:text-white hover:bg-white/10 rounded-lg transition-all" onClick={toggleMenu}>
          {isOpen ? <X size={26} /> : <Search size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col gap-4 glass-card p-4 border-t border-white/10 dark:border-gray-700/30">
          <a href="/" className="hover:text-green-600 dark:hover:text-green-400 dark:text-gray-300">Home</a>
          <a href="/forum" className="hover:text-green-600 dark:hover:text-green-400 dark:text-gray-300">Forum</a>
          {/* Search Mobile */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full glass-input rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
          </div>

          {/* Dark Mode */}
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-2 p-2 glass-button rounded-lg transition-all"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span>Dark Mode</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
