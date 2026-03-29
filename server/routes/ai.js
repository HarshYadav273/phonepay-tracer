const express = require("express");
const router = express.Router();

router.post("/insights", async (req, res) => {
  try {
    const { transactions } = req.body;

    const totalSpent = transactions
      .filter((t) => t.type === "DEBIT")
      .reduce((sum, t) => sum + t.amount, 0);

    const merchantTotals = transactions
      .filter((t) => t.type === "DEBIT")
      .reduce((acc, t) => {
        acc[t.merchant] = (acc[t.merchant] || 0) + t.amount;
        return acc;
      }, {});

    const topMerchants = Object.entries(merchantTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => `${name}: ₹${amount}`)
      .join(", ");

    const prompt = `
Mera PhonePe transaction data hai:
- Total Spent: ₹${totalSpent}
- Top Merchants: ${topMerchants}
- Total Transactions: ${transactions.length}

Mujhe Hindi/Hinglish mein batao:
1. Spending pattern kaisa hai?
2. Kahan zyada kharch ho raha hai?
3. Kaise save kar sakta hoon?
4. Koi unusual spending hai?

Short aur friendly tone mein batao — 5-6 lines mein!
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );

    const data = await response.json();
    console.log("Gemini Response:", JSON.stringify(data, null, 2));
    const insights =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "Response nahi aaya";

    res.json({ success: true, insights });
  } catch (err) {
    console.error("AI Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
