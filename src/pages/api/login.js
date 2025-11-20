import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Cookies from "cookies";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, password, remember } = req.body;

  try {
    // ===== 1. CARI USER BERDASARKAN EMAIL =====
    const q = query(collection(db, "users"), where("email", "==", email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return res.status(400).json({ error: "User not found" });
    }

    const userData = snapshot.docs[0].data();

    // ===== 2. VALIDASI PASSWORD =====
    const isValid = userData.password === password;

    if (!isValid) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // ===== 3. ATUR COOKIE REMEMBER ME (7 hari / 1 hari) =====
    const cookieDuration = remember
      ? 7 * 24 * 60 * 60 * 1000
      : 24 * 60 * 60 * 1000;

    const cookies = new Cookies(req, res);

    cookies.set(
      "user",
      JSON.stringify({
        id: userData.email,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      }),
      {
        httpOnly: false, // kalau mau aman: true
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: cookieDuration,
      }
    );

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
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ error: "Login failed, server error" });
  }
}
