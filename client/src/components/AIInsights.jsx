import { useEffect, useState } from "react";

const BUTTON_COOLDOWN_SECONDS = 15;

export default function AIInsights({ transactions }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cooldownLeft, setCooldownLeft] = useState(0);

  useEffect(() => {
    if (cooldownLeft <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setCooldownLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownLeft]);

  const getInsights = async () => {
    if (loading || cooldownLeft > 0) {
      return;
    }

    setLoading(true);
    setError(null);
    setCooldownLeft(BUTTON_COOLDOWN_SECONDS);

    try {
      const res = await fetch("http://localhost:5000/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.retryAfterSeconds) {
          setCooldownLeft(
            Math.max(BUTTON_COOLDOWN_SECONDS, data.retryAfterSeconds),
          );
        }

        throw new Error(data.error || "Insights abhi available nahi hain.");
      }

      setInsights(data.insights);
    } catch (err) {
      setError(err.message || "AI se connect nahi hua - dobara try karo.");
    } finally {
      setLoading(false);
    }
  };

  const buttonLabel = loading
    ? "Analyzing..."
    : cooldownLeft > 0
      ? `Retry in ${cooldownLeft}s`
      : "Analyze Karo";

  return (
    <div className="mx-6 mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-orange-300">AI Insights</h3>
        <button
          onClick={getInsights}
          disabled={loading || cooldownLeft > 0}
          className="rounded-xl bg-orange-500 px-4 py-2 text-sm text-white transition disabled:cursor-not-allowed disabled:bg-orange-900 disabled:text-orange-200"
        >
          {buttonLabel}
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded-xl border border-red-500/40 bg-red-950/40 p-4">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {cooldownLeft > 0 && !loading && (
        <p className="mb-3 text-xs text-orange-200/80">
          Extra API calls avoid karne ke liye button thodi der ke liye locked
          hai.
        </p>
      )}

      {insights && (
        <div className="rounded-xl border border-orange-500/30 bg-gray-900 p-4">
          <p className="whitespace-pre-wrap text-gray-300">{insights}</p>
        </div>
      )}
    </div>
  );
}
