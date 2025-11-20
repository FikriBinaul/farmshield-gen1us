import { useState } from "react";
import { useRouter } from "next/router";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // VALIDASI FORM
  const validateForm = () => {
    if (name.trim().length < 3) return "Nama minimal 3 karakter";
    if (!email.includes("@")) return "Email tidak valid";
    if (password.length < 6) return "Password minimal 6 karakter";
    return "";
  };

  // REGISTER USER
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      // CEK EMAIL SUDAH ADA ATAU BELUM
      const q = query(collection(db, "users"), where("email", "==", email));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        setError("Email sudah digunakan");
        setLoading(false);
        return;
      }

      // SIMPAN USER KE FIRESTORE
      await addDoc(collection(db, "users"), {
        name,
        email,
        password, // TODO: nanti diganti hash
        role: "user",
        createdAt: serverTimestamp(),
      });

      router.push("/login");
    } catch (err) {
      console.error(err);
      setError("Registrasi gagal, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-3">
      <form
        onSubmit={handleRegister}
        className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Daftar Akun Baru
        </h2>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Nama */}
        <label className="text-sm font-medium">Nama Lengkap</label>
        <input
          type="text"
          className="border p-3 rounded w-full mb-4 mt-1 focus:ring-2 focus:ring-green-600"
          placeholder="Nama lengkap"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Email */}
        <label className="text-sm font-medium">Email</label>
        <input
          type="email"
          className="border p-3 rounded w-full mb-4 mt-1 focus:ring-2 focus:ring-green-600"
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <label className="text-sm font-medium">Password</label>
        <div className="relative mb-4">
          <input
            type={showPass ? "text" : "password"}
            className="border p-3 rounded w-full pr-10 mt-1 focus:ring-2 focus:ring-green-600"
            placeholder="Minimal 6 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-4 cursor-pointer text-gray-500 hover:text-gray-700"
          >
            {showPass ? (
              <EyeSlashIcon className="w-5" />
            ) : (
              <EyeIcon className="w-5" />
            )}
          </span>
        </div>

        {/* Password Strength */}
        {password && (
          <p
            className={`text-xs mb-4 ${
              password.length < 6
                ? "text-red-500"
                : password.length < 10
                ? "text-yellow-600"
                : "text-green-600"
            }`}
          >
            {password.length < 6
              ? "Password lemah"
              : password.length < 10
              ? "Password cukup"
              : "Password kuat"}
          </p>
        )}

        {/* Tombol Register */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded text-white font-medium transition ${
            loading
              ? "bg-green-300 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Memproses..." : "Daftar"}
        </button>

        <p className="text-center text-sm mt-5 text-gray-600">
          Sudah punya akun?{" "}
          <a href="/login" className="text-green-700 hover:underline">
            Login di sini
          </a>
        </p>
      </form>
    </div>
  );
}
