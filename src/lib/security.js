// Security utilities untuk middleware dan API routes

/**
 * Validasi struktur cookie user dengan session timeout
 * Lebih fleksibel untuk backward compatibility
 */
export function validateUserCookie(cookieValue) {
  if (!cookieValue) return null;

  try {
    const user = JSON.parse(cookieValue);
    
    // Validasi struktur dasar (wajib)
    if (!user || typeof user !== 'object') return null;
    if (!user.email || typeof user.email !== 'string') return null;
    if (!user.role || !['admin', 'user'].includes(user.role)) return null;
    
    // ID bisa dari email jika tidak ada (backward compatibility)
    if (!user.id) {
      user.id = user.email;
    }
    
    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) return null;
    
    // Validasi panjang (prevent DoS)
    if (user.email.length > 255 || (user.name && user.name.length > 255)) return null;
    
    // Session timeout check (hanya jika ada loginTime)
    // Jika tidak ada loginTime, anggap cookie valid (backward compatibility)
    if (user.loginTime && typeof user.loginTime === 'number') {
      const sessionTimeout = user.remember 
        ? 7 * 24 * 60 * 60 * 1000  // 7 hari untuk remember me
        : 24 * 60 * 60 * 1000;      // 1 hari untuk normal
      
      const sessionAge = Date.now() - user.loginTime;
      
      // Jika session expired, return null
      if (sessionAge > sessionTimeout) {
        return null; // Session expired
      }
      
      // Jika session terlalu lama (lebih dari 30 hari), invalid
      if (sessionAge > 30 * 24 * 60 * 60 * 1000) {
        return null;
      }
    }
    
    return user;
  } catch (error) {
    // Jika parsing gagal, return null
    return null;
  }
}

/**
 * Sanitize path untuk mencegah path traversal
 * Lebih permisif untuk path normal
 */
export function sanitizePath(path) {
  if (!path || typeof path !== 'string') return path; // Return as-is jika invalid
  
  // Hanya block jika ada pattern berbahaya yang jelas
  // Jangan block path normal seperti /dashboard atau /api/login
  const dangerousPatterns = [
    /\.\./,           // Path traversal
    /\/\/+/,          // Multiple slashes (bisa jadi path traversal)
    /\\/,             // Backslash
    /\0/,             // Null byte
    /%2e%2e/i,        // URL encoded ..
    /%5c/i,           // URL encoded backslash
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(path)) {
      return null; // Block dangerous path
    }
  }
  
  return path; // Path aman
}

/**
 * Rate limiting storage (in-memory, untuk production gunakan Redis)
 */
const rateLimitStore = new Map();

export function checkRateLimit(identifier, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const key = identifier;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  const record = rateLimitStore.get(key);
  
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

/**
 * Cleanup rate limit store (jalankan secara berkala)
 */
export function cleanupRateLimit() {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Cleanup setiap 5 menit
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimit, 5 * 60 * 1000);
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken() {
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback untuk environment tanpa crypto
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Security headers
 */
export function getSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': process.env.NODE_ENV === 'production' 
      ? 'max-age=31536000; includeSubDomains' 
      : '',
  };
}

/**
 * Log security event (untuk monitoring)
 */
export function logSecurityEvent(type, details, req) {
  const logData = {
    timestamp: new Date().toISOString(),
    type,
    details,
    ip: req?.headers?.['x-forwarded-for'] || req?.ip || 'unknown',
    userAgent: req?.headers?.['user-agent'] || 'unknown',
    path: req?.nextUrl?.pathname || req?.url || 'unknown',
  };
  
  // Di production, kirim ke logging service
  if (process.env.NODE_ENV === 'production') {
    console.warn('[SECURITY EVENT]', JSON.stringify(logData));
  } else {
    console.warn('[SECURITY EVENT]', logData);
  }
}

