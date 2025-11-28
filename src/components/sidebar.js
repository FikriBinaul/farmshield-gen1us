import Link from "next/link";
import { useRouter } from "next/router";
import {
  LayoutDashboard,
  Radio,
  BookOpen,
  Users,
  Sprout,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Map,
} from "lucide-react";
import { useSidebar } from "@/contexts/SidebarContext";

export default function Sidebar({ role = "user" }) {
  const router = useRouter();
  const { open, setOpen } = useSidebar();

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: role === "admin" ? "/dashboard" : "/dashboard-user",
    },
    { name: "Deteksi Kutu Putih", icon: Sprout, path: "/deteksi" },
    { name: "Peta Statistik", icon: Map, path: "/peta-statistik" },
    { name: "Forum", icon: Users, path: "/forum" },
    { name: "Radio Petani", icon: Radio, path: "/radio" },
    { name: "Ensiklopedia", icon: BookOpen, path: "/ensiklopedia" },
    { name: "Chat", icon: MessageCircle, path: "/chat" },
    { name: "Akun", icon: Users, path: "/akun" },
  ];

  return (
    <aside
      className={`
      fixed top-0 left-0 h-screen z-50
      flex flex-col justify-between
      bg-green-900 dark:bg-gray-900
      backdrop-blur-md
      border-r border-green-700/50 dark:border-gray-700/50
      shadow-xl
      transition-all duration-300
      ${open ? "w-64" : "w-20"}
      `}
    >
      {/* Wrapper Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-green-700 scrollbar-track-green-900/50">

        {/* Toggle Button */}
        <button
          onClick={() => setOpen(!open)}
          className="absolute top-5 -right-3
          bg-green-800 hover:bg-green-700
          dark:bg-gray-800 dark:hover:bg-gray-700
          text-white p-1 rounded-full shadow-lg transition-all duration-200 border border-green-700/50"
        >
          {open ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-6 border-b border-green-700/50 dark:border-gray-700/50">
          <Sprout className="text-white" size={28} />
          {open && (
            <h1 className="text-xl font-semibold tracking-wide text-white drop-shadow-lg">
              {role === "admin" ? "Admin Panel" : "User Panel"}
            </h1>
          )}
        </div>

        {/* Menu */}
        <nav className="mt-4 space-y-1 px-2">
          {menuItems.map((item) => {
            const active = router.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  group flex items-center gap-3 p-3 rounded-xl
                  transition-all duration-200

                  ${active
                    ? "bg-green-700 dark:bg-green-800 text-white shadow-lg border border-green-600/50"
                    : "text-gray-200 dark:text-gray-300 hover:bg-green-800/50 dark:hover:bg-green-800/30 hover:text-white"
                  }
                `}
              >
                {/* Icon Animasi */}
                <Icon
                  size={22}
                  className={`
                    transition-transform duration-200 
                    group-hover:scale-110
                    ${active ? "text-white" : "text-gray-200 dark:text-gray-300"}
                  `}
                />
                {open && (
                  <span className="font-medium tracking-wide text-gray-200 dark:text-gray-300">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-green-700/50 dark:border-gray-700/50 bg-green-800/30 dark:bg-gray-800/30">
        <button
          onClick={() => {
            document.cookie =
              "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            router.push("/");
          }}
          className="flex items-center gap-3 w-full
          bg-red-600 hover:bg-red-700
          dark:bg-red-700 dark:hover:bg-red-800
          border border-red-500/50 dark:border-red-600/50
          p-3 rounded-xl text-white font-medium transition-all duration-200 group shadow-md"
        >
          <LogOut
            size={20}
            className="group-hover:scale-110 transition-transform duration-200"
          />
          {open && "Logout"}
        </button>
      </div>
    </aside>
  );
}
