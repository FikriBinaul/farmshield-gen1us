import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  doc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  setDoc,
  getDoc,
} from "firebase/firestore";
import Cookies from "js-cookie";

export default function ChatRoom() {
  const router = useRouter();
  const { id: otherUserId } = router.query;

  const [currentUser, setCurrentUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // Ambil data user dari cookie
  useEffect(() => {
    const raw = Cookies.get("user");
    if (!raw) {
      router.push("/login");
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      setCurrentUser(parsed);
    } catch (e) {
      console.error("Invalid cookie");
      router.push("/login");
    }
  }, []);

  // Ambil profil lawan chat
  useEffect(() => {
    if (!otherUserId) return;

    const fetchOther = async () => {
      const snap = await getDoc(doc(db, "users", otherUserId));
      if (snap.exists()) {
        setOtherUser({ id: snap.id, ...snap.data() });
      }
    };

    fetchOther();
  }, [otherUserId]);

  // Buat chat ID unik
  const chatId =
    currentUser && otherUserId
      ? currentUser.id < otherUserId
        ? `${currentUser.id}_${otherUserId}`
        : `${otherUserId}_${currentUser.id}`
      : null;

  // Listen pesan realtime
  useEffect(() => {
    if (!chatId || !currentUser) return;

    const chatRef = doc(db, "chats", chatId);

    // Buat chat doc jika belum ada
    getDoc(chatRef).then((snap) => {
      if (!snap.exists()) {
        setDoc(chatRef, {
          participants: [currentUser.id, otherUserId],
        });
      }
    });

    // Listen messages
    const msgRef = collection(db, "chats", chatId, "messages");
    const q = query(msgRef, orderBy("timestamp"));

    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(msgs);
    });

    return () => unsub();
  }, [chatId, currentUser]);

  // Kirim pesan
  const sendMessage = async () => {
    if (!text.trim()) return;

    await addDoc(collection(db, "chats", chatId, "messages"), {
      sender: currentUser.id,
      text,
      timestamp: new Date(),
    });

    setText("");
  };

  if (!currentUser) return <p>Loading...</p>;

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-100">
      {/* HEADER */}
      <div className="p-4 bg-white shadow mb-3 rounded flex items-center">
        <button onClick={() => router.back()} className="mr-4">
          ← Back
        </button>
        <h1 className="font-bold text-lg">
          {otherUser ? otherUser.name : "Loading..."}
        </h1>
      </div>

      {/* PESAN */}
      <div className="flex-1 overflow-y-auto border p-4 rounded bg-white">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 p-2 rounded max-w-xs ${
              msg.sender === currentUser.id
                ? "bg-blue-500 text-white ml-auto"
                : "bg-gray-200"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="flex mt-3">
        <input
          className="flex-1 border p-2 rounded"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ketik pesan…"
        />
        <button
          onClick={sendMessage}
          className="ml-2 bg-blue-600 text-white px-4 rounded"
        >
          Kirim
        </button>
      </div>
    </div>
  );
}
