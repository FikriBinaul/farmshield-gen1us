import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");

  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError("Email tidak ditemukan");
        return;
      }

      const userDoc = snapshot.docs[0];
      setUserId(userDoc.id);

      setStep(2);
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await updateDoc(doc(db, "users", userId), {
        password: newPassword,
      });

      alert("Password berhasil diubah!");
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      setError("Gagal mereset password");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Lupa Password
        </h2>

        {step === 1 && (
          <form onSubmit={handleCheckEmail} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Masukkan email"
              className="border p-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Cek Email
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-3">
            <input
              type="password"
              placeholder="Password baru"
              className="border p-2 rounded"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="bg-green-600 text-white p-2 rounded hover:bg-green-700"
            >
              Reset Password
            </button>
          </form>
        )}

        <p className="text-center text-sm mt-4">
          <a href="/login" className="text-blue-600 hover:underline">
            Kembali ke Login
          </a>
        </p>
      </div>
    </div>
  );
}
