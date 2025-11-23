"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Cookies from "js-cookie";

export const dynamic = "force-dynamic";

export default function ChatRoom() {
  const router = useRouter();
  const { chatId } = useParams();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const sender = JSON.parse(Cookies.get("user"))?.email;

  // ==============================
  // LOAD MESSAGES REALTIME
  // ==============================
  useEffect(() => {
    const msgRef = collection(db, `chats/${chatId}/messages`);
    const q = query(msgRef, orderBy("timestamp", "asc"));

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [chatId]);

  // ==============================
  // SEND MESSAGE
  // ==============================
  const sendMessage = async () => {
    if (!text.trim()) return;

    await addDoc(collection(db, `chats/${chatId}/messages`), {
      sender,
      text,
      timestamp: serverTimestamp(),
    });

    setText("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ============================== HEADER ============================== */}
      <div className="p-4 bg-white border-b shadow-sm flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold text-gray-700">Chat Room</h1>
      </div>

      {/* ============================== CHAT AREA ============================== */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.sender === sender;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-xs shadow 
                  ${isMe ? "bg-blue-600 text-white rounded-br-none" : "bg-white border rounded-bl-none"}`}
              >
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================== INPUT AREA ============================== */}
      <div className="p-3 bg-white border-t flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Ketik pesan..."
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full shadow"
        >
          Kirim
        </button>
      </div>
    </div>
  );
}
