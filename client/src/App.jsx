import { useState } from "react";
import Upload from "./components/Upload";
import Dashboard from "./components/Dashboard";
import BudgetAlert from "./components/BudgetAlert";
import AIInsights from "./components/AIInsights";

export default function App() {
  const [transactions, setTransactions] = useState(null);
  const [budget, setBudget] = useState("");
  const [showBudgetInput, setShowBudgetInput] = useState(false);

  if (!transactions) {
    return <Upload onUpload={setTransactions} />;
  }

  return (
    <div className="bg-gray-950 min-h-screen pb-10">
      {/* Budget Setup */}
      <div className="px-6 pt-6 flex justify-end">
        <button
          onClick={() => setShowBudgetInput(!showBudgetInput)}
          className="text-sm bg-gray-800 hover:bg-gray-700 text-orange-400 px-4 py-2 rounded-xl"
        >
          🎯 Budget Set Karo
        </button>
      </div>

      {showBudgetInput && (
        <div className="px-6 mt-3">
          <input
            type="number"
            placeholder="Monthly budget daalo (₹)"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full bg-gray-900 text-white border border-orange-500/40 rounded-xl px-4 py-2 outline-none"
          />
        </div>
      )}

      {/* Budget Alert */}
      <BudgetAlert transactions={transactions} budget={budget} />

      {/* Dashboard */}
      <Dashboard transactions={transactions} />

      {/* AI Insights */}
      <AIInsights transactions={transactions} />

      {/* Reset Button */}
      <div className="px-6 mt-6">
        <button
          onClick={() => setTransactions(null)}
          className="w-full bg-gray-800 hover:bg-gray-700 text-gray-400 py-3 rounded-xl"
        >
          🔄 Naya PDF Upload Karo
        </button>
      </div>
    </div>
  );
}
