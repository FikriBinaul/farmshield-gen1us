"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
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
import { uploadPhoto, validateImageFile } from "@/lib/uploadHelper";
import { Image as ImageIcon, X } from "lucide-react";


export default function ChatRoom() {
  const router = useRouter();
  const chatId = router.query.id || null;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const userCookie = Cookies.get("user");
  const sender = userCookie ? JSON.parse(userCookie)?.email : null;

  // ==============================
  // LOAD MESSAGES REALTIME
  // ==============================
  useEffect(() => {
    if (!router.isReady || !chatId) return;

    const msgRef = collection(db, `chats/${chatId}/messages`);
    const q = query(msgRef, orderBy("timestamp", "asc"));

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [router.isReady, chatId]);

  // ==============================
  // PHOTO HANDLING
  // ==============================
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setPhoto(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  // ==============================
  // SEND MESSAGE
  // ==============================
  const sendMessage = async () => {
    if ((!text.trim() && !photo) || !chatId) return;

    setUploadingPhoto(!!photo);
    let photoUrl = null;

    if (photo) {
      try {
        photoUrl = await uploadPhoto(photo, 'chat');
      } catch (err) {
        console.error("Photo upload error:", err);
        alert("Gagal upload foto");
        setUploadingPhoto(false);
        return;
      }
    }

    try {
      await addDoc(collection(db, `chats/${chatId}/messages`), {
        sender,
        text: text.trim(),
        photoUrl: photoUrl,
        timestamp: serverTimestamp(),
      });

      setText("");
      removePhoto();
    } catch (err) {
      console.error("Send message error:", err);
      alert("Gagal mengirim pesan");
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (!router.isReady || !chatId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading chat...</p>
      </div>
    );
  }

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
                {msg.text && <p className="text-sm">{msg.text}</p>}
                {msg.photoUrl && (
                  <div className="mt-2">
                    <img
                      src={msg.photoUrl}
                      alt="Message attachment"
                      className="max-w-full rounded-lg"
                      style={{ maxHeight: '300px', objectFit: 'contain' }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================== INPUT AREA ============================== */}
      <div className="p-3 bg-white border-t">
        {photoPreview && (
          <div className="mb-2 relative inline-block">
            <img
              src={photoPreview}
              alt="Preview"
              className="max-w-xs max-h-32 rounded-lg border border-gray-300"
            />
            <button
              onClick={removePhoto}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <label className="cursor-pointer inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition">
            <ImageIcon className="w-5 h-5 text-gray-600" />
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            className="flex-1 border px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Ketik pesan..."
          />

          <button
            onClick={sendMessage}
            disabled={uploadingPhoto}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-full shadow"
          >
            {uploadingPhoto ? "Uploading..." : "Kirim"}
          </button>
        </div>
      </div>
    </div>
  );
}
