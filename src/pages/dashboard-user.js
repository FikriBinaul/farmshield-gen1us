import UserLayout from "@/layouts/userlayout";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function DashboardUser() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔐 Cek login dan ambil data user
   useEffect(() => {
    const cookieUser = Cookies.get("user");
    if (!cookieUser) {
      router.push("/login");
      return;
    }

    try {
      const parsed = JSON.parse(cookieUser);
      setUser(parsed);

      if (parsed.role === "admin") {
        router.push("/dashboard");
      } else {
        loadUserData(parsed.email);
      }
    } catch (err) {
      Cookies.remove("user");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, []);

  //Ambil data user dari Firestore
  const loadUserData = async (email) => {
    const q = query(collection(db, "users"), where("email", "==", email));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      setData(snapshot.docs[0].data());
    }
  };

  // 🚪 Logout
  const handleLogout = async () => {
    await fetch("/api/logout");
    Cookies.remove("user");
    router.push("/login");
  };

  if (!user || !data) return <p>Loading...</p>;

  return (
    <UserLayout>
      <div className="p-8">
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">
            Dashboard User – Welcome, {data.name}
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        <div className="border rounded p-6 bg-gray-50 w-96">
          <p><strong>Nama:</strong> {data.name}</p>
          <p><strong>Email:</strong> {data.email}</p>
          <p><strong>Role:</strong> {data.role}</p>
        </div>

        <p className="mt-4 text-gray-600">
          Kamu login sebagai <strong>user biasa</strong>.<br />
          Hanya bisa melihat data sendiri.
        </p>
      </div>
    </UserLayout>
  );
}
