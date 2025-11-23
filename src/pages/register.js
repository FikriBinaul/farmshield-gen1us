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
import { Eye, EyeOff, Mail, Lock, User, Sprout, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import LeafAnimation from "@/components/LeafAnimation";

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

  const getPasswordStrength = () => {
    if (password.length === 0) return { strength: 0, text: "", color: "" };
    if (password.length < 6) return { strength: 1, text: "Lemah", color: "text-red-500" };
    if (password.length < 10) return { strength: 2, text: "Cukup", color: "text-yellow-500" };
    return { strength: 3, text: "Kuat", color: "text-green-500" };
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

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-green-100 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-12 relative overflow-hidden">
      <LeafAnimation leafCount={10} speed="slow" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card Container */}
        <div className="glass-card p-8">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-4 shadow-lg backdrop-blur-sm border border-white/20"
            >
              <Sprout className="text-white" size={32} />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Daftar Akun Baru
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Buat akun FarmShield Anda sekarang
            </p>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-4 glass-alert bg-red-500/10 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-400/30 dark:border-red-800/30 p-3 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Nama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="Nama lengkap"
                  className="w-full pl-10 pr-4 py-3 glass-input text-gray-900 dark:text-white
                           focus:outline-none transition-all duration-200"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  type="email"
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-4 py-3 glass-input text-gray-900 dark:text-white
                           focus:outline-none transition-all duration-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-10 pr-12 py-3 glass-input text-gray-900 dark:text-white
                           focus:outline-none transition-all duration-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 
                           hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
                        className={`h-full ${
                          passwordStrength.strength === 1
                            ? "bg-red-500"
                            : passwordStrength.strength === 2
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                      />
                    </div>
                    <span className={`text-xs font-medium ${passwordStrength.color}`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className={`flex items-center gap-1 ${password.length >= 6 ? "text-green-600 dark:text-green-400" : ""}`}>
                      {password.length >= 6 && <CheckCircle2 size={12} />}
                      Min. 6 karakter
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading || !!validateForm()}
              whileHover={{ scale: loading || !!validateForm() ? 1 : 1.02 }}
              whileTap={{ scale: loading || !!validateForm() ? 1 : 0.98 }}
              className={`w-full py-3 rounded-xl text-white font-semibold transition-all duration-200
                       flex items-center justify-center gap-2
                       ${
                         loading || validateForm()
                           ? "bg-gray-400/50 dark:bg-gray-600/50 cursor-not-allowed backdrop-blur-sm"
                           : "glass-button bg-gradient-to-r from-green-600/80 to-green-700/80 hover:from-green-600 hover:to-green-700 border-green-500/50 text-white"
                       }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  Daftar
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sudah punya akun?{" "}
              <a
                href="/login"
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 
                         font-semibold transition-colors inline-flex items-center gap-1"
              >
                Login di sini
                <ArrowRight size={14} />
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
