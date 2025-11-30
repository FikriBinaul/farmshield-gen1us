// Helper function untuk chat dengan Google Gemini AI
// API Key dari environment variable (lebih aman)
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyD_x6hQ6ldttE0-V7Iys3jPh2hiEFC356A";

// Daftar model yang akan dicoba (dari yang terbaru)
const GEMINI_MODELS = [
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro-latest", 
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-pro"
];

// Base URL untuk Gemini API
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

/**
 * Mengirim pesan ke Google Gemini AI dan mendapatkan response
 * @param {string} message - Pesan dari user
 * @param {Array} conversationHistory - Riwayat percakapan (optional)
 * @returns {Promise<string>} - Response dari AI
 */
export async function chatWithAI(message, conversationHistory = []) {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key tidak ditemukan. Silakan set NEXT_PUBLIC_GEMINI_API_KEY di environment variable.");
  }

  // Siapkan context untuk AI (bisa disesuaikan dengan domain pertanian/kutu putih)
  const systemContext = `Anda adalah asisten AI yang ahli dalam bidang pertanian, khususnya dalam mengatasi masalah hama tanaman seperti kutu putih (whitefly). 
  Berikan jawaban yang informatif, praktis, dan mudah dipahami. Gunakan bahasa Indonesia yang ramah dan profesional.
  Jika pertanyaan tidak terkait pertanian, tetap berikan jawaban yang membantu.`;

  // Format conversation history untuk Gemini
  const contents = [];
  
  // Tambahkan system context sebagai bagian pertama
  contents.push({
    role: "user",
    parts: [{ text: systemContext }]
  });
  contents.push({
    role: "model",
    parts: [{ text: "Baik, saya siap membantu Anda dengan pertanyaan tentang pertanian dan hama tanaman." }]
  });

  // Tambahkan conversation history jika ada
  conversationHistory.forEach((msg) => {
    if (msg.sender === "user") {
      contents.push({
        role: "user",
        parts: [{ text: msg.text }]
      });
    } else if (msg.sender === "ai") {
      contents.push({
        role: "model",
        parts: [{ text: msg.text }]
      });
    }
  });

  // Tambahkan pesan terbaru
  contents.push({
    role: "user",
    parts: [{ text: message }]
  });

  // Coba setiap model sampai berhasil
  let lastError = null;
  
  for (const model of GEMINI_MODELS) {
    try {
      const apiUrl = `${GEMINI_BASE_URL}/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        lastError = new Error(errorData.error?.message || `API error: ${response.status}`);
        
        // Jika model tidak ditemukan, coba model berikutnya
        if (response.status === 404 || errorData.error?.message?.includes("not found")) {
          console.warn(`Model ${model} tidak tersedia, mencoba model berikutnya...`);
          continue;
        }
        
        throw lastError;
      }

      const data = await response.json();
      
      // Extract response text dari Gemini
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        console.log(`✅ Berhasil menggunakan model: ${model}`);
        return data.candidates[0].content.parts[0].text;
      }

      throw new Error("No response from AI");
    } catch (error) {
      // Jika ini bukan error 404 atau "not found", throw langsung
      if (!error.message?.includes("not found") && error.message !== lastError?.message) {
        console.error(`Error dengan model ${model}:`, error);
        lastError = error;
        
        // Jika ini model terakhir, throw error
        if (model === GEMINI_MODELS[GEMINI_MODELS.length - 1]) {
          throw error;
        }
        continue;
      }
      
      lastError = error;
      // Lanjut ke model berikutnya
      continue;
    }
  }

  // Jika semua model gagal
  throw lastError || new Error("Semua model Gemini gagal. Pastikan API key valid dan billing sudah diaktifkan.");
}

/**
 * Format conversation history dari Firebase messages untuk AI
 * @param {Array} messages - Array of messages dari Firebase
 * @param {string} userEmail - Email user yang sedang chat
 * @returns {Array} - Formatted conversation history
 */
export function formatConversationHistory(messages, userEmail) {
  return messages
    .filter(msg => msg.text && msg.text.trim()) // Hanya pesan dengan text
    .map(msg => ({
      sender: msg.sender === userEmail ? "user" : "ai",
      text: msg.text,
      timestamp: msg.timestamp,
    }))
    .slice(-10); // Ambil 10 pesan terakhir untuk context
}

