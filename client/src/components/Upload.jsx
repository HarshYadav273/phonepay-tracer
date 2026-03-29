import { useState } from "react";
import { getApiUrl } from "../lib/api";

export default function Upload({ onUpload }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await fetch(getApiUrl("/upload"), {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        onUpload(data.transactions);
      } else {
        setError("PDF parse nahi hua — dobara try karo");
      }
    } catch (err) {
      setError("Server se connect nahi hua");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 p-10 rounded-2xl shadow-xl text-center">
        <h1 className="text-3xl font-bold mb-2 text-orange-400">
          💸 PhonePe Tracker
        </h1>
        <p className="text-gray-400 mb-6">Apna PhonePe statement upload karo</p>

        <label className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition">
          {loading ? "Uploading..." : "📄 PDF Upload Karo"}
          <input
            type="file"
            accept=".pdf"
            onChange={handleFile}
            className="hidden"
          />
        </label>

        {error && <p className="text-red-400 mt-4">{error}</p>}
      </div>
    </div>
  );
}
