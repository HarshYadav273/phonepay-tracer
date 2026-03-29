const express = require("express");
const Groq = require("groq-sdk");

const router = express.Router();

const MAX_RETRIES = 2;
const BASE_RETRY_DELAY_MS = 1500;
const BUTTON_COOLDOWN_MS = 15 * 1000;
const requestLog = new Map();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetry(status) {
  return status === 429 || status >= 500;
}

function getRetryMessage(retryAfterSeconds) {
  if (!retryAfterSeconds) {
    return "AI insights ke liye thoda wait karke dobara try karo.";
  }

  return `AI insights ke liye ${retryAfterSeconds} second baad dobara try karo.`;
}

function createGroqClient() {
  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
}

router.post("/insights", async (req, res) => {
  try {
    const clientKey = req.ip || req.headers["x-forwarded-for"] || "unknown";
    const now = Date.now();
    const lastRequestedAt = requestLog.get(clientKey);

    if (lastRequestedAt && now - lastRequestedAt < BUTTON_COOLDOWN_MS) {
      const retryAfterSeconds = Math.ceil(
        (BUTTON_COOLDOWN_MS - (now - lastRequestedAt)) / 1000,
      );

      return res.status(429).json({
        success: false,
        error: getRetryMessage(retryAfterSeconds),
        retryAfterSeconds,
      });
    }

    requestLog.set(clientKey, now);

    const { transactions } = req.body;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Transactions missing hain. Pehle statement upload karo.",
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "GROQ_API_KEY missing hai. Server config check karo.",
      });
    }

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
      .map(([name, amount]) => `${name}: Rs.${amount}`)
      .join(", ");

    const prompt = `
Here is my PhonePe transaction data:
- Total Spent: Rs.${totalSpent}
- Top Merchants: ${topMerchants}
- Total Transactions: ${transactions.length}

Please answer in English:
1. What is the spending pattern?
2. Where is most of the money being spent?
3. How can I save more?
4. Is there any unusual spending?

Keep the response short, friendly, and practical in 5-6 lines.
Preserve merchant names and any original non-English terms exactly as they appear in the transaction data.
    `;

    const groq = createGroqClient();
    let completion;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
      try {
        completion = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          temperature: 0.5,
          messages: [
            {
              role: "system",
              content:
                "You are a helpful personal finance assistant. Analyze PhonePe transaction data and respond in short, practical, friendly English. Preserve merchant names and any original non-English terms exactly as they appear in the transaction data.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        break;
      } catch (error) {
        const status = error?.status || error?.response?.status;

        if (!shouldRetry(status) || attempt === MAX_RETRIES) {
          throw error;
        }

        await sleep(BASE_RETRY_DELAY_MS * (attempt + 1));
      }
    }

    console.log("Groq Response:", JSON.stringify(completion, null, 2));

    const insights =
      completion?.choices?.[0]?.message?.content?.trim() ||
      "Response nahi aaya";

    return res.json({ success: true, insights });
  } catch (err) {
    console.error("AI Error:", err);
    const status = err?.status || err?.response?.status || 500;
    const errorMessage =
      err?.error?.message ||
      err?.message ||
      (status === 429
        ? "Groq quota ya rate limit hit ho gayi. Thoda baad dobara try karo."
        : "Groq se valid response nahi mila.");

    return res.status(status).json({
      success: false,
      error: errorMessage,
      retryAfterSeconds: status === 429 ? 60 : undefined,
    });
  }
});

module.exports = router;
