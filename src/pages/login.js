import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
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
        window.location.href = data.redirect;
      } else {
        setError(data.error || "Login gagal");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-3">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md"
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Selamat Datang 👋
        </h1>

        {/* Error message */}
        {error && (
          <div className="mb-4 bg-red-50 text-red-600 border border-red-300 p-3 rounded text-sm">
            {error}
          </div>
        )}

        {/* Email */}
        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            placeholder="Masukkan email"
            className="border p-3 rounded w-full mt-1 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div className="relative">
          <label className="text-sm font-medium">Password</label>
          <input
            type={showPass ? "text" : "password"}
            placeholder="Masukkan password"
            className="border p-3 rounded w-full mt-1 mb-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-10 cursor-pointer text-gray-500 hover:text-gray-700"
          >
            {showPass ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </div>
        </div>

        {/* Remember me */}
        <label className="flex items-center mb-4 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="mr-2"
          />
          Ingat saya
        </label>

        {/* Forgot password */}
        <div className="text-right -mt-3 mb-5">
          <p className="text-center text-sm mt-3 text-gray-600">
            <a href="/forgot-password" className="text-blue-600 hover:underline">
              Lupa Password?
            </a>
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || validate()}
          className={`w-full py-3 rounded text-white font-medium transition ${
            loading || validate()
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>

        <p className="text-center text-sm mt-5 text-gray-600">
          Belum punya akun?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Daftar sekarang
          </a>
        </p>
      </form>
    </div>
  );
}
