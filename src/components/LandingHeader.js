import { useState } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useRouter } from "next/router";
import { useDarkMode } from "@/contexts/DarkModeContext";

export default function LandingHeader() {
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="w-full glass-navbar dark:text-white fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <div 
          onClick={() => router.push("/")}
          className="font-bold text-xl dark:text-white cursor-pointer hover:text-green-600 dark:hover:text-green-400 transition"
        >
          FarmShield
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6 items-center">
          <a 
            href="/" 
            className="hover:text-green-600 dark:hover:text-green-400 dark:text-gray-300 transition"
          >
            Home
          </a>
          <a 
            href="/login" 
            className="hover:text-green-600 dark:hover:text-green-400 dark:text-gray-300 transition"
          >
            Login
          </a>
          <a 
            href="/robotik" 
            className="hover:text-green-600 dark:hover:text-green-400 dark:text-gray-300 transition"
          >
            Robotik
          </a>
          <a 
            href="/mesin-learning" 
            className="hover:text-green-600 dark:hover:text-green-400 dark:text-gray-300 transition"
          >
            Mesin Learning
          </a>
          <a 
            href="/rpl" 
            className="hover:text-green-600 dark:hover:text-green-400 dark:text-gray-300 transition"
          >
            RPL
          </a>
          <a 
            href="/tatatulis" 
            className="hover:text-green-600 dark:hover:text-green-400 dark:text-gray-300 transition"
          >
            Tatatulis
          </a>
          <a 
            href="/about-us" 
            className="hover:text-green-600 dark:hover:text-green-400 dark:text-gray-300 transition"
          >
            About Us
          </a>

          {/* Dark mode toggle */}
          <button 
            onClick={toggleDarkMode} 
            className="p-2 rounded-full glass-button hover:bg-white/20 dark:hover:bg-white/10 transition-all"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>

        {/* Mobile Hamburger */}
        <button 
          className="md:hidden p-2 dark:text-white" 
          onClick={toggleMenu}
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col gap-4 glass-card p-4 border-t border-white/10 dark:border-gray-700/30">
          <a 
            href="/" 
            className="hover:text-green-600 dark:hover:text-green-400 dark:text-gray-300 transition"
            onClick={() => setIsOpen(false)}
          >
            Home
          </a>
          <a 
            href="/login" 
            className="hover:text-green-600 dark:hover:text-green-400 dark:text-gray-300 transition"
            onClick={() => setIsOpen(false)}
          >
            Login
          </a>
          <a 
            href="/robotik" 
            className="hover:text-green-600 dark:hover:text-green-400 dark:text-gray-300 transition"
            onClick={() => setIsOpen(false)}
          >
            Robotik
          </a>
          <a 
            href="/mesin-learning" 
            className="hover:text-green-600 dark:hover:text-green-400 dark:text-gray-300 transition"
            onClick={() => setIsOpen(false)}
          >
            Mesin Learning
          </a>
          <a 
            href="/rpl" 
            className="hover:text-green-600 dark:hover:text-green-400 dark:text-gray-300 transition"
            onClick={() => setIsOpen(false)}
          >
            RPL
          </a>
          <a 
            href="/tatatulis" 
            className="hover:text-green-600 dark:hover:text-green-400 dark:text-gray-300 transition"
            onClick={() => setIsOpen(false)}
          >
            Tatatulis
          </a>
          <a 
            href="/about-us" 
            className="hover:text-green-600 dark:hover:text-green-400 dark:text-gray-300 transition"
            onClick={() => setIsOpen(false)}
          >
            About Us
          </a>

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

