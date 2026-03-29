export default function BudgetAlert({ transactions, budget }) {
  const totalSpent = transactions
    .filter((t) => t.type === "DEBIT")
    .reduce((sum, t) => sum + t.amount, 0);

  const percentage = Math.round((totalSpent / budget) * 100);
  const isOver = totalSpent > budget;

  if (!budget) return null;

  return (
    <div
      className={`mx-6 mt-4 p-4 rounded-xl border ${isOver ? "bg-red-900/40 border-red-500" : "bg-yellow-900/40 border-yellow-500"}`}
    >
      <div className="flex justify-between items-center mb-2">
        <p className="font-semibold text-white">
          {isOver ? "🚨 Budget Exceed Ho Gaya!" : "⚠️ Budget Status"}
        </p>
        <p
          className={`font-bold ${isOver ? "text-red-400" : "text-yellow-400"}`}
        >
          {percentage}%
        </p>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${isOver ? "bg-red-500" : "bg-yellow-500"}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <p className="text-gray-400 text-sm mt-2">
        ₹{totalSpent} / ₹{budget} spent
      </p>
    </div>
  );
}
