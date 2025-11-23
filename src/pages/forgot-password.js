import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { Mail, Lock, Sprout, ArrowRight, CheckCircle2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LeafAnimation from "@/components/LeafAnimation";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError("Email tidak ditemukan");
        setLoading(false);
        return;
      }

      const userDoc = snapshot.docs[0];
      setUserId(userDoc.id);
      setStep(2);
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    setLoading(true);

    try {
      await updateDoc(doc(db, "users", userId), {
        password: newPassword,
      });

      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      console.error(err);
      setError("Gagal mereset password");
    } finally {
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
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Lupa Password
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {step === 1 ? "Masukkan email untuk reset password" : "Buat password baru"}
            </p>
          </div>

          {/* Success Message */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 glass-alert bg-green-500/10 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-400/30 dark:border-green-800/30 p-4 flex items-center gap-3"
              >
                <CheckCircle2 size={20} />
                <div>
                  <p className="font-semibold">Password berhasil diubah!</p>
                  <p className="text-sm">Mengalihkan ke halaman login...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 glass-alert bg-red-500/10 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-400/30 dark:border-red-800/30 p-3 text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 1: Check Email */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleCheckEmail}
                className="space-y-5"
              >
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

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className={`w-full py-3 rounded-xl text-white font-semibold transition-all duration-200
                           flex items-center justify-center gap-2
                           ${
                             loading
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
                      Cek Email
                      <ArrowRight size={18} />
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}

            {/* Step 2: Reset Password */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleResetPassword}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password Baru
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                    <input
                      type={showPass ? "text" : "password"}
                      placeholder="Minimal 6 karakter"
                      className="w-full pl-10 pr-12 py-3 glass-input text-gray-900 dark:text-white
                               focus:outline-none transition-all duration-200"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      placeholder="Ulangi password"
                      className="w-full pl-10 pr-12 py-3 glass-input text-gray-900 dark:text-white
                               focus:outline-none transition-all duration-200"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 
                               hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showConfirmPass ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">Password tidak cocok</p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={loading || newPassword !== confirmPassword || newPassword.length < 6}
                  whileHover={{ scale: loading || newPassword !== confirmPassword || newPassword.length < 6 ? 1 : 1.02 }}
                  whileTap={{ scale: loading || newPassword !== confirmPassword || newPassword.length < 6 ? 1 : 0.98 }}
                  className={`w-full py-3 rounded-xl text-white font-semibold transition-all duration-200
                           flex items-center justify-center gap-2
                           ${
                             loading || newPassword !== confirmPassword || newPassword.length < 6
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
                      Reset Password
                      <CheckCircle2 size={18} />
                    </>
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 
                           font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <ArrowLeft size={14} />
                  Kembali
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <a
              href="/login"
              className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 
                       font-semibold transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft size={14} />
              Kembali ke Login
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
