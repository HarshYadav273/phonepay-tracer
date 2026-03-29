import { useState } from "react";

export default function AIInsights({ transactions }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const getInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions }),
      });
      const data = await res.json();
      setInsights(data.insights);
    } catch (err) {
      setInsights("AI se connect nahi hua — dobara try karo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-6 mt-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-orange-300">
          🤖 AI Insights
        </h3>
        <button
          onClick={getInsights}
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded-xl transition"
        >
          {loading ? "Analyzing..." : "Analyze Karo"}
        </button>
      </div>

      {insights && (
        <div className="bg-gray-900 border border-orange-500/30 rounded-xl p-4">
          <p className="text-gray-300 whitespace-pre-wrap">{insights}</p>
        </div>
      )}
    </div>
  );
}
