const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Only these sites may call the API from a browser. Add your live domain(s) via ALLOWED_ORIGINS (comma-separated).
const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:5173",
  ...(process.env.ALLOWED_ORIGINS || "").split(",").map((o) => o.trim()).filter(Boolean),
];

// Middleware
app.set("trust proxy", 1);
app.use(cors({ origin: allowedOrigins, methods: ["POST"] }));
app.use(express.json({ limit: "20kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, emailConfigured: Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS) });
});

// Contact Route: validation, spam protection and email sending live in contact.mjs (shared with api/contact.js)
app.post("/api/contact", async (req, res) => {
  const { handleContact } = await import("./contact.mjs");
  const { status, json } = await handleContact(req.body, req.ip);
  res.status(status).json(json);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
