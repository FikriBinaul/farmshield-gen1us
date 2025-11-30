// Helper function untuk chat dengan Google Gemini AI
// API Key dari environment variable (lebih aman)
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyD_x6hQ6ldttE0-V7Iys3jPh2hiEFC356A";

// Daftar model yang akan dicoba (dari yang terbaru dan pasti tersedia)
const GEMINI_MODELS = [
  "gemini-2.0-flash",      // Model terbaru (2024)             // Fallback (mungkin deprecated tapi tetap dicoba)
];

// Base URL untuk Gemini API - gunakan v1beta untuk model terbaru
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
  // Format sesuai curl example: contents adalah array of objects dengan "parts" array
  // Untuk conversation, kita bisa menggunakan format dengan role atau tanpa role
  const contents = [];
  
  // Jika ada conversation history, gunakan format dengan role untuk multi-turn conversation
  if (conversationHistory.length > 0) {
    // Tambahkan system context sebagai user message pertama
    contents.push({
      role: "user",
      parts: [{ text: systemContext }]
    });
    contents.push({
      role: "model",
      parts: [{ text: "Baik, saya siap membantu Anda dengan pertanyaan tentang pertanian dan hama tanaman." }]
    });

    // Tambahkan conversation history
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
  } else {
    // Jika tidak ada history, gunakan format sederhana (tanpa role)
    // Gabungkan system context dengan message
    const fullMessage = `${systemContext}\n\nPertanyaan: ${message}`;
    contents.push({
      parts: [{ text: fullMessage }]
    });
  }

  // Coba setiap model sampai berhasil
  let lastError = null;
  let lastErrorDetails = null;
  
  for (let i = 0; i < GEMINI_MODELS.length; i++) {
    const model = GEMINI_MODELS[i];
    const isLastModel = i === GEMINI_MODELS.length - 1;
    
    try {
      // Gunakan header X-goog-api-key sesuai dokumentasi resmi
      const apiUrl = `${GEMINI_BASE_URL}/models/${model}:generateContent`;
      
      console.log(`🔄 Mencoba model: ${model}`);
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_API_KEY,
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

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMessage = responseData.error?.message || `API error: ${response.status}`;
        lastError = new Error(errorMessage);
        lastErrorDetails = responseData.error;
        
        // Jika model tidak ditemukan (404) atau "not found", coba model berikutnya
        if (response.status === 404 || errorMessage.toLowerCase().includes("not found") || errorMessage.toLowerCase().includes("is not supported")) {
          console.warn(`⚠️ Model ${model} tidak tersedia: ${errorMessage}`);
          if (!isLastModel) {
            console.log(`➡️ Mencoba model berikutnya...`);
            continue;
          }
        }
        
        // Jika error lain dan ini model terakhir, throw
        if (isLastModel) {
          throw lastError;
        }
        continue;
      }

      // Extract response text dari Gemini
      if (responseData.candidates && responseData.candidates[0] && responseData.candidates[0].content) {
        const responseText = responseData.candidates[0].content.parts[0].text;
        console.log(`✅ Berhasil menggunakan model: ${model}`);
        return responseText;
      }

      // Jika tidak ada response text
      if (isLastModel) {
        throw new Error("No response from AI - response structure tidak valid");
      }
      continue;
      
    } catch (error) {
      // Jika error network atau error lain
      const errorMessage = error.message || String(error);
      
      // Jika error "not found" dan bukan model terakhir, lanjut ke model berikutnya
      if ((errorMessage.toLowerCase().includes("not found") || 
           errorMessage.toLowerCase().includes("is not supported")) && 
          !isLastModel) {
        console.warn(`⚠️ Model ${model} error: ${errorMessage}`);
        console.log(`➡️ Mencoba model berikutnya...`);
        lastError = error;
        continue;
      }
      
      // Jika ini model terakhir atau error fatal, throw
      if (isLastModel) {
        console.error(`❌ Semua model gagal. Error terakhir:`, error);
        throw error;
      }
      
      lastError = error;
      continue;
    }
  }

  // Jika semua model gagal (seharusnya tidak sampai sini karena sudah throw di loop)
  const finalError = lastError || new Error("Semua model Gemini gagal. Pastikan API key valid dan billing sudah diaktifkan di Google Cloud Console.");
  
  if (lastErrorDetails) {
    console.error("Error details:", lastErrorDetails);
  }
  
  throw finalError;
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

