import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
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
} from "lucide-react";

export default function Sidebar({ role = "user" }) {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: role === "admin" ? "/dashboard" : "/dashboard-user",
    },
    { name: "Deteksi Kutu Putih", icon: Sprout, path: "/deteksi" },
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
      bg-gradient-to-b from-green-900 to-green-700
      border-r border-green-950/40 shadow-xl
      backdrop-blur-md
      transition-all duration-300
      ${open ? "w-64" : "w-20"}
      `}
    >
      {/* Wrapper Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-green-900/30">

        {/* Toggle Button */}
        <button
          onClick={() => setOpen(!open)}
          className="absolute top-5 -right-3 bg-green-900 hover:bg-green-950
          text-white p-1 rounded-full shadow-lg transition-all duration-200"
        >
          {open ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-6 border-b border-green-900/40">
          <Sprout className="text-white" size={28} />
          {open && (
            <h1 className="text-xl font-semibold tracking-wide text-white drop-shadow">
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
                    ? "bg-green-950 text-white shadow-inner"
                    : "text-green-100 hover:bg-green-800 hover:text-white"
                  }
                `}
              >
                {/* Icon Animasi */}
                <Icon
                  size={22}
                  className={`
                    transition-transform duration-200 
                    group-hover:scale-110
                    ${active ? "text-white" : "text-green-200"}
                  `}
                />
                {open && (
                  <span className="font-medium tracking-wide">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-green-900/40 bg-green-900/20 backdrop-blur-sm">
        <button
          onClick={() => {
            document.cookie =
              "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            router.push("/");
          }}
          className="flex items-center gap-3 w-full bg-red-600 hover:bg-red-700
          p-3 rounded-xl text-white transition-all duration-200 group"
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
