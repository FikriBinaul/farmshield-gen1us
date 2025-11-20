import { useState } from "react";
import { Moon, Sun, Menu, X, Search } from "lucide-react";
import { useSidebar } from "@/contexts/SidebarContext";

export default function Header() {
  const { open } = useSidebar();
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const toggleDark = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <header className="w-full border-b bg-white dark:bg-gray-900 dark:text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">

        {/* Logo */}
        <div className="font-bold text-xl">Farmshield</div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6 items-center">
          <a href="/" className="hover:text-green-600">Home</a>
          <a href="/forum" className="hover:text-green-600">Forum</a>
          <a href="/about" className="hover:text-green-600">About</a>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="border rounded-lg px-3 py-1 dark:bg-gray-800"
            />
            <Search className="absolute right-2 top-2 h-4 w-4 text-gray-500" />
          </div>

          {/* Dark mode toggle */}
          <button onClick={toggleDark} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>

        {/* Mobile Hamburger */}
        <button className="md:hidden p-2" onClick={toggleMenu}>
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col gap-4 bg-gray-50 dark:bg-gray-800 p-4 border-t dark:border-gray-700">
          <a href="/" className="hover:text-green-600">Home</a>
          <a href="/products" className="hover:text-green-600">Products</a>
          <a href="/forum" className="hover:text-green-600">Forum</a>
          <a href="/about" className="hover:text-green-600">About</a>

          {/* Search Mobile */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700"
            />
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          </div>

          {/* Dark Mode */}
          <button
            onClick={toggleDark}
            className="flex items-center gap-2 p-2 bg-gray-200 rounded-lg dark:bg-gray-700"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span>Dark Mode</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
