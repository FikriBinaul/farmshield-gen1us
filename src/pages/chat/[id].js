"use client";

import { useEffect, useState, useRef } from "react";
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
import { Image as ImageIcon, X, Bot } from "lucide-react";
import { chatWithAI, formatConversationHistory } from "@/lib/aiChat";


export default function ChatRoom() {
  const router = useRouter();
  const chatId = router.query.id || null;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [aiResponding, setAiResponding] = useState(false);
  const messagesEndRef = useRef(null);

  const userCookie = Cookies.get("user");
  const sender = userCookie ? JSON.parse(userCookie)?.email : null;
  const isAIChat = chatId === "ai-assistant";

  // ==============================
  // LOAD MESSAGES REALTIME
  // ==============================
  useEffect(() => {
    if (!router.isReady || !chatId) return;

    // Untuk AI chat, kita tidak perlu load dari Firebase
    if (isAIChat) {
      // Load dari localStorage atau state saja
      const savedMessages = localStorage.getItem(`ai-chat-${sender}`);
      if (savedMessages) {
        try {
          setMessages(JSON.parse(savedMessages));
        } catch (e) {
          console.error("Error loading saved messages:", e);
        }
      }
      return;
    }

    const msgRef = collection(db, `chats/${chatId}/messages`);
    const q = query(msgRef, orderBy("timestamp", "asc"));

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [router.isReady, chatId, isAIChat, sender]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

    const messageText = text.trim();
    setText("");

    // Handle photo upload (not supported for AI chat yet)
    if (photo && !isAIChat) {
      setUploadingPhoto(true);
      let photoUrl = null;
      try {
        photoUrl = await uploadPhoto(photo, 'chat');
      } catch (err) {
        console.error("Photo upload error:", err);
        alert("Gagal upload foto");
        setUploadingPhoto(false);
        return;
      }
      removePhoto();
      setUploadingPhoto(false);
    }

    // Handle AI chat
    if (isAIChat) {
      if (!messageText) return;

      // Add user message to local state
      const userMessage = {
        id: `user-${Date.now()}`,
        sender: sender,
        text: messageText,
        timestamp: new Date(),
      };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      localStorage.setItem(`ai-chat-${sender}`, JSON.stringify(newMessages));

      // Get AI response
      setAiResponding(true);
      try {
        const conversationHistory = formatConversationHistory(messages, sender);
        const aiResponse = await chatWithAI(messageText, conversationHistory);

        // Add AI response to messages
        const aiMessage = {
          id: `ai-${Date.now()}`,
          sender: "ai-assistant",
          text: aiResponse,
          timestamp: new Date(),
        };
        const updatedMessages = [...newMessages, aiMessage];
        setMessages(updatedMessages);
        localStorage.setItem(`ai-chat-${sender}`, JSON.stringify(updatedMessages));
      } catch (error) {
        console.error("Error getting AI response:", error);
        let errorText = "Maaf, terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi.";
        
        // Berikan pesan error yang lebih spesifik
        if (error.message?.includes("not found")) {
          errorText = "Model AI tidak tersedia. Silakan hubungi administrator.";
        } else if (error.message?.includes("API error")) {
          errorText = "Terjadi kesalahan pada API. Silakan coba lagi dalam beberapa saat.";
        } else if (error.message) {
          errorText = `Error: ${error.message}`;
        }
        
        const errorMessage = {
          id: `ai-error-${Date.now()}`,
          sender: "ai-assistant",
          text: errorText,
          timestamp: new Date(),
          isError: true,
        };
        const updatedMessages = [...newMessages, errorMessage];
        setMessages(updatedMessages);
        localStorage.setItem(`ai-chat-${sender}`, JSON.stringify(updatedMessages));
      } finally {
        setAiResponding(false);
      }
      return;
    }

    // Handle regular chat (Firebase)
    try {
      await addDoc(collection(db, `chats/${chatId}/messages`), {
        sender,
        text: messageText,
        photoUrl: photo ? await uploadPhoto(photo, 'chat') : null,
        timestamp: serverTimestamp(),
      });

      removePhoto();
    } catch (err) {
      console.error("Send message error:", err);
      alert("Gagal mengirim pesan");
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
      <div className={`p-4 border-b shadow-sm flex items-center gap-3 ${isAIChat ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'bg-white'}`}>
        <button
          onClick={() => router.back()}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
        >
          ← Back
        </button>
        {isAIChat ? (
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-blue-700">AI Assistant</h1>
          </div>
        ) : (
          <h1 className="text-xl font-bold text-gray-700">Chat Room</h1>
        )}
      </div>

      {/* ============================== CHAT AREA ============================== */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && isAIChat && (
          <div className="text-center py-8 text-gray-500">
            <Bot className="w-12 h-12 mx-auto mb-4 text-blue-400" />
            <p className="text-lg font-semibold mb-2">Selamat datang di AI Assistant!</p>
            <p className="text-sm">Tanyakan apapun tentang pertanian, hama tanaman, atau kutu putih.</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender === sender;
          const isAI = msg.sender === "ai-assistant";
          const isError = msg.isError;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-xs md:max-w-md shadow 
                  ${isMe 
                    ? "bg-blue-600 text-white rounded-br-none" 
                    : isAI 
                    ? isError
                      ? "bg-red-50 border border-red-200 rounded-bl-none"
                      : "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-bl-none" 
                    : "bg-white border rounded-bl-none"}`}
              >
                {isAI && (
                  <div className="flex items-center gap-2 mb-1">
                    <Bot className={`w-4 h-4 ${isError ? 'text-red-600' : 'text-green-600'}`} />
                    <span className={`text-xs font-semibold ${isError ? 'text-red-700' : 'text-green-700'}`}>
                      {isError ? 'Error' : 'AI Assistant'}
                    </span>
                  </div>
                )}
                {msg.text && (
                  <p className={`text-sm whitespace-pre-wrap ${isAI ? (isError ? 'text-red-800' : 'text-gray-800') : ''}`}>
                    {String(msg.text || '')}
                  </p>
                )}
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
        {aiResponding && (
          <div className="flex justify-start">
            <div className="px-4 py-2 rounded-2xl bg-gray-100 border">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-gray-500 animate-pulse" />
                <span className="text-sm text-gray-600">AI sedang mengetik...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
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
            disabled={uploadingPhoto || aiResponding || (!text.trim() && !photo)}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-full shadow"
          >
            {uploadingPhoto ? "Uploading..." : aiResponding ? "Mengirim..." : "Kirim"}
          </button>
        </div>
      </div>
    </div>
  );
}
