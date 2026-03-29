const express = require("express");
const router = express.Router();
const multer = require("multer");

async function pdfParse(buffer) {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(buffer);
  const doc = await pdfjsLib.getDocument({ data }).promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(" ") + "\n";
  }
  return { text };
}

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("pdf"), async (req, res) => {
  try {
    const data = await pdfParse(req.file.buffer);
    const text = data.text;

    const transactions = parseTransactions(text);
    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

function parseTransactions(text) {
  const transactions = [];

  const pattern =
    /((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}\s+\d{1,2}:\d{2}\s+(am|pm))\s+(DEBIT|CREDIT)\s+₹\s*([\d,]+)\s+Paid to\s+(.+?)(?=\s+Transaction ID)/gi;

  let match;
  while ((match = pattern.exec(text)) !== null) {
    transactions.push({
      date: match[1].trim(),
      type: match[4].trim(),
      amount: parseFloat(match[5].replace(",", "")),
      merchant: match[6].trim(),
    });
  }

  return transactions;
}
module.exports = router;
