# Konfigurasi API Deteksi

File ini menjelaskan cara mengkonfigurasi API untuk fitur deteksi kutu putih.

## Setup

1. Buat file `.env.local` di root project
2. Tambahkan API key sesuai provider yang digunakan:

```env
# Untuk Grok API
NEXT_PUBLIC_GROK_API_KEY=your_grok_api_key_here

# Atau untuk OpenAI API (alternatif)
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here

# Atau untuk Custom API (FastAPI)
NEXT_PUBLIC_CUSTOM_API_URL=http://localhost:8000/detect
```

## Mengganti Provider

Edit file `src/lib/apiConfig.js` dan ubah `provider`:

```javascript
export const API_CONFIG = {
  provider: 'grok', // Ganti ke 'grok', 'openai', atau 'custom'
  // ...
};
```

## Provider yang Didukung

### 1. Grok API (X.AI)
- Endpoint: `https://api.x.ai/v1/chat/completions`
- Model: `grok-beta` atau `grok-2`
- Menggunakan vision API untuk analisis gambar
- Response format: JSON dengan struktur `{count, boxes}`

### 2. OpenAI API
- Endpoint: `https://api.openai.com/v1/chat/completions`
- Model: `gpt-4-vision-preview`
- Menggunakan vision API untuk analisis gambar
- Response format: JSON dengan struktur `{count, boxes}`

### 3. Custom API (FastAPI)
- Endpoint: Custom (default: `http://localhost:8000/detect`)
- Method: POST
- Format: FormData dengan file image
- Response format: JSON dengan struktur `{count, boxes}`

## Format Response yang Diharapkan

Semua provider harus mengembalikan response dalam format:

```json
{
  "count": 2,
  "boxes": [
    {
      "xyxy": [100, 150, 200, 250],
      "class_name": "whitefly",
      "confidence": 0.85
    },
    {
      "xyxy": [300, 400, 350, 450],
      "class_name": "mealybug",
      "confidence": 0.92
    }
  ]
}
```

## Catatan

- Grok/OpenAI API akan mengirim gambar sebagai base64
- Custom API akan mengirim gambar sebagai FormData
- Interval deteksi: 2 detik untuk Grok/OpenAI, 400ms untuk Custom API
- Pastikan API key disimpan dengan aman dan tidak di-commit ke repository

