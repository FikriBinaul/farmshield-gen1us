// Konfigurasi API untuk deteksi
// Ganti konfigurasi di bawah ini untuk menggunakan API yang berbeda

export const API_CONFIG = {
  // Pilih provider: 'grok', 'openai', 'custom'
  provider: 'grok',
  
  // Grok API Configuration
  grok: {
    endpoint: 'https://api.x.ai/v1/chat/completions',
    apiKey: process.env.NEXT_PUBLIC_GROK_API_KEY || '', // Set di .env.local
    model: 'grok-beta', // atau 'grok-2' jika tersedia
    maxTokens: 1000,
    temperature: 0.7,
  },
  
  // OpenAI API Configuration (alternatif)
  openai: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    model: 'gpt-4-vision-preview',
    maxTokens: 1000,
    temperature: 0.7,
  },
  
  // Custom API Configuration (untuk FastAPI atau API lain)
  custom: {
    endpoint: process.env.NEXT_PUBLIC_CUSTOM_API_URL || 'http://localhost:8000/detect',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  },
};

// Helper function untuk mendapatkan konfigurasi aktif
export function getActiveConfig() {
  const config = { ...API_CONFIG[API_CONFIG.provider] };
  config.provider = API_CONFIG.provider; // Tambahkan provider ke config
  return config;
}

// Helper function untuk mengubah provider
export function setProvider(provider) {
  if (['grok', 'openai', 'custom'].includes(provider)) {
    API_CONFIG.provider = provider;
  }
}

