"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { useRouter } from "next/router";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import Cookies from "js-cookie";

// Layout
import AdminLayout from "@/layouts/adminlayout";
import UserLayout from "@/layouts/userlayout";

export default function ChatList() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // AMBIL USER DARI COOKIE
  // ============================================================
  useEffect(() => {
    const raw = Cookies.get("user");

    if (!raw) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      setCurrentUser(parsed);
    } catch (err) {
      console.error("Cookie rusak:", err);
      setCurrentUser(null);
      setLoading(false);
    }
  }, []);

  // Redirect jika belum login
  useEffect(() => {
    if (currentUser === null) {
      router.push("/login");
    }
  }, [currentUser]);

  // ============================================================
  // LOAD DAFTAR USER DARI FIRESTORE
  // ============================================================
  useEffect(() => {
    if (!currentUser) {
      // Jika currentUser null, pastikan loading sudah false
      if (currentUser === null) {
        setLoading(false);
      }
      return;
    }

    const loadUsers = async () => {
      try {
        const snap = await getDocs(collection(db, "users"));
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setUsers(list);
      } catch (err) {
        console.error("Gagal load users:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [currentUser]);

  // ============================================================
  // BUKA / BUAT CHAT BERDASARKAN EMAIL
  // ============================================================
  const openChat = async (targetEmail) => {
    const myEmail = currentUser.email;

    // Cek apakah chat sudah ada
    const q = query(
      collection(db, "chats"),
      where("members", "array-contains", myEmail)
    );

    const snap = await getDocs(q);

    let chatFound = null;

    snap.forEach((doc) => {
      const data = doc.data();
      if (data.members.includes(targetEmail)) {
        chatFound = doc.id;
      }
    });

    // Jika sudah ada → redirect
    if (chatFound) {
      router.push(`/chat/${chatFound}`);
      return;
    }

    // Buat chat baru
    const newChat = await addDoc(collection(db, "chats"), {
      members: [myEmail, targetEmail],
      createdAt: serverTimestamp(),
    });

    router.push(`/chat/${newChat.id}`);
  };

  // ============================================================
  // LOADING
  // ============================================================
  if (currentUser === undefined || loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        <div className="animate-spin h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (currentUser === null) return <></>;

  const Layout = currentUser.role === "admin" ? AdminLayout : UserLayout;

  // ============================================================
  // UI
  // ============================================================
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Daftar User untuk Chat</h1>

        <div className="grid gap-4">
          {users
            .filter((u) => u.email !== currentUser.email)
            .map((u) => (
              <div
                key={u.email}
                onClick={() => openChat(u.email)}
                className="p-4 border rounded-lg shadow bg-white cursor-pointer hover:bg-green-50 hover:border-green-600 transition"
              >
                <p className="font-semibold text-lg text-green-800">{u.name}</p>
                <p className="text-sm text-gray-600">{u.email}</p>
              </div>
            ))}
        </div>
      </div>
    </Layout>
  );
}
