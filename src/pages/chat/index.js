import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { useRouter } from "next/router";
import { collection, getDocs } from "firebase/firestore";
import Cookies from "js-cookie";

export default function ChatList() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(undefined); // undefined = belum cek

  // Ambil data user dari cookie
  useEffect(() => {
    const raw = Cookies.get("user");

    if (!raw) {
      setCurrentUser(null);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      setCurrentUser(parsed);
    } catch (err) {
      console.error("Cookie invalid!", err);
      setCurrentUser(null);
    }
  }, []);

  // Redirect kalau belum login
  useEffect(() => {
    if (currentUser === null) {
      router.push("/login");
    }
  }, [currentUser]);

  // Ambil semua user dari Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(collection(db, "users"));
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setUsers(list);
      } catch (err) {
        console.error("Gagal mengambil user:", err);
      }
    };

    fetchUsers();
  }, []);

  // Saat mengecek login, tampilkan loading
  if (currentUser === undefined) {
    return <p>Loading...</p>;
  }

  // Saat user tidak login, return kosong (redirect berjalan)
  if (currentUser === null) {
    return <></>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Daftar User</h1>

      {users
        .filter((u) => u.email !== currentUser.email)
        .map((u) => (
          <a
            key={u.id}
            href={`/chat/${u.id}`}
            className="block p-3 border rounded mb-2 hover:bg-gray-100 transition"
          >
            <p className="font-semibold">{u.name}</p>
            <p className="text-sm text-gray-600">{u.email}</p>
          </a>
        ))}
    </div>
  );
}
