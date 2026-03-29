export default function Dashboard({ transactions }) {
  const totalSpent = transactions
    .filter((t) => t.type === "DEBIT")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalReceived = transactions
    .filter((t) => t.type === "CREDIT")
    .reduce((sum, t) => sum + t.amount, 0);

  const merchantTotals = transactions
    .filter((t) => t.type === "DEBIT")
    .reduce((acc, t) => {
      acc[t.merchant] = (acc[t.merchant] || 0) + t.amount;
      return acc;
    }, {});

  const topMerchants = Object.entries(merchantTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="p-6 bg-gray-950 min-h-screen text-white">
      <h2 className="text-2xl font-bold text-orange-400 mb-4">
        📊 Spending Dashboard
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        {transactions[transactions.length - 1].date
          .split(" ")
          .slice(0, 3)
          .join(" ")}{" "}
        → {transactions[0].date.split(" ").slice(0, 3).join(" ")} • Total Spent:{" "}
        <span className="text-red-400 font-semibold">₹{totalSpent}</span>
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-red-900/40 border border-red-500 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Total Spent</p>
          <p className="text-2xl font-bold text-red-400">₹{totalSpent}</p>
        </div>
        <div className="bg-green-900/40 border border-green-500 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Total Received</p>
          <p className="text-2xl font-bold text-green-400">₹{totalReceived}</p>
        </div>
      </div>

      {/* Top Merchants */}
      <h3 className="text-lg font-semibold text-orange-300 mb-3">
        🏪 Top Merchants
      </h3>
      <div className="space-y-3 mb-8">
        {topMerchants.map(([merchant, amount]) => (
          <div
            key={merchant}
            className="flex justify-between items-center bg-gray-900 px-4 py-3 rounded-xl"
          >
            <span className="text-gray-300">{merchant}</span>
            <span className="text-red-400 font-bold">₹{amount}</span>
          </div>
        ))}
      </div>

      {/* Transaction List */}
      <h3 className="text-lg font-semibold text-orange-300 mb-3">
        📋 All Transactions
      </h3>
      <div className="space-y-2">
        {transactions.map((t, i) => (
          <div
            key={i}
            className="flex justify-between items-center bg-gray-900 px-4 py-3 rounded-xl"
          >
            <div>
              <p className="text-white font-medium">{t.merchant}</p>
              <p className="text-gray-500 text-xs">{t.date}</p>
            </div>
            <span
              className={`font-bold ${t.type === "DEBIT" ? "text-red-400" : "text-green-400"}`}
            >
              {t.type === "DEBIT" ? "-" : "+"}₹{t.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
