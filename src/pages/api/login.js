import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Cookies from "cookies";
import { checkRateLimit, getSecurityHeaders, logSecurityEvent, sanitizePath } from "@/lib/security";

export default async function handler(req, res) {
  // Set security headers
  Object.entries(getSecurityHeaders()).forEach(([key, value]) => {
    if (value) {
      res.setHeader(key, value);
    }
  });

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Rate limiting untuk login
  const ip = req.headers["x-forwarded-for"] || req.connection?.remoteAddress || "unknown";
  const rateLimit = checkRateLimit(`login:${ip}`, 5, 900000); // 5 attempts per 15 minutes
  
  if (!rateLimit.allowed) {
    logSecurityEvent("LOGIN_RATE_LIMIT", { ip }, req);
    res.setHeader("Retry-After", "900");
    return res.status(429).json({ error: "Too many login attempts. Please try again later." });
  }

  // Validasi input
  const { email, password, remember } = req.body;

  // Sanitize dan validasi email
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email is required" });
  }

  const sanitizedEmail = email.trim().toLowerCase();
  if (sanitizedEmail.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
    logSecurityEvent("INVALID_EMAIL_FORMAT", { ip, email: sanitizedEmail.substring(0, 20) }, req);
    return res.status(400).json({ error: "Invalid email format" });
  }

  // Validasi password
  if (!password || typeof password !== "string") {
    return res.status(400).json({ error: "Password is required" });
  }

  if (password.length > 1000) {
    logSecurityEvent("PASSWORD_TOO_LONG", { ip }, req);
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    // ===== 1. CARI USER BERDASARKAN EMAIL =====
    const q = query(collection(db, "users"), where("email", "==", sanitizedEmail));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Jangan reveal bahwa user tidak ada (security best practice)
      logSecurityEvent("LOGIN_FAILED", { ip, reason: "user_not_found" }, req);
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const userData = snapshot.docs[0].data();

    // ===== 2. VALIDASI PASSWORD =====
    // TODO: Gunakan bcrypt untuk hash password di production
    const isValid = userData.password === password;

    if (!isValid) {
      logSecurityEvent("LOGIN_FAILED", { ip, reason: "invalid_password", userId: userData.email }, req);
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // ===== 3. ATUR COOKIE REMEMBER ME (7 hari / 1 hari) =====
    const cookieDuration = remember
      ? 7 * 24 * 60 * 60 * 1000
      : 24 * 60 * 60 * 1000;

    const cookies = new Cookies(req, res);

    // Validasi role
    if (!userData.role || !["admin", "user"].includes(userData.role)) {
      logSecurityEvent("INVALID_ROLE", { ip, userId: userData.email }, req);
      return res.status(500).json({ error: "Account configuration error" });
    }

    // Set secure cookie
    // Note: httpOnly: false untuk kompatibilitas dengan js-cookie di client
    // Di production, pertimbangkan menggunakan httpOnly: true dan server-side rendering
    cookies.set(
      "user",
      JSON.stringify({
        id: userData.email,
        name: userData.name || "",
        email: userData.email,
        role: userData.role,
        loginTime: Date.now(), // Untuk session timeout
        remember: Boolean(remember), // Simpan preferensi remember me
      }),
      {
        httpOnly: false, // Allow JavaScript access untuk kompatibilitas
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        sameSite: "lax", // Lebih fleksibel dari strict untuk kompatibilitas
        maxAge: cookieDuration,
        path: "/",
      }
    );

    logSecurityEvent("LOGIN_SUCCESS", { ip, userId: userData.email, role: userData.role }, req);

    // ===== 4. REDIRECT BERDASARKAN ROLE =====
    const redirectTo =
      userData.role === "admin" ? "/dashboard" : "/dashboard-user";

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: userData.email,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      },
      redirect: redirectTo,
    });
  } catch (error) {
    logSecurityEvent("LOGIN_ERROR", { ip, error: error.message }, req);
    console.error("LOGIN ERROR:", error);
    // Jangan expose error details ke client
    return res.status(500).json({ error: "Login failed. Please try again later." });
  }
}
