import { useState } from "react";
import { useRouter } from "next/router";
import { Eye, EyeOff, Mail, Lock, Sprout, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import LeafAnimation from "@/components/LeafAnimation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!email.includes("@")) return "Email tidak valid";
    if (password.length < 6) return "Password minimal 6 karakter";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();

    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      });

      const data = await res.json();

      if (res.ok) {
        // Gunakan router.push untuk memicu loading screen
        router.push(data.redirect);
      } else {
        setError(data.error || "Login gagal");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan, coba lagi");
      setLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Selamat Datang
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Masuk ke akun FarmShield Anda
            </p>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-4 glass-alert bg-red-500/10 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-400/30 dark:border-red-800/30 p-3 text-sm flex items-center gap-2"
            >
              <span className="font-medium">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="Masukkan password"
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
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 
                           dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  Ingat saya
                </span>
              </label>
              <a
                href="/forgot-password"
                className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 
                         font-medium transition-colors"
              >
                Lupa Password?
              </a>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading || !!validate()}
              whileHover={{ scale: loading || !!validate() ? 1 : 1.02 }}
              whileTap={{ scale: loading || !!validate() ? 1 : 0.98 }}
              className={`w-full py-3 rounded-xl text-white font-semibold transition-all duration-200
                       flex items-center justify-center gap-2
                       ${
                         loading || validate()
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
                  Masuk
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Belum punya akun?{" "}
              <a
                href="/register"
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 
                         font-semibold transition-colors inline-flex items-center gap-1"
              >
                Daftar sekarang
                <ArrowRight size={14} />
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
