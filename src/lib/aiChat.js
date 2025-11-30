// Helper function untuk chat dengan Google Gemini AI
const GEMINI_API_KEY = "AIzaSyD_x6hQ6ldttE0-V7Iys3jPh2hiEFC356A";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

/**
 * Mengirim pesan ke Google Gemini AI dan mendapatkan response
 * @param {string} message - Pesan dari user
 * @param {Array} conversationHistory - Riwayat percakapan (optional)
 * @returns {Promise<string>} - Response dari AI
 */
export async function chatWithAI(message, conversationHistory = []) {
  try {
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

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract response text dari Gemini
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    }

    throw new Error("No response from AI");
  } catch (error) {
    console.error("Error chatting with AI:", error);
    throw error;
  }
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

