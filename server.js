require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const natural = require("natural");
const fuzzball = require("fuzzball");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" })); 

// MongoDB chat log
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

const ChatLog = mongoose.model("ChatLog", new mongoose.Schema({
  question: String,
  answer: String,
  timestamp: { type: Date, default: Date.now },
}));

// Load model
const { qaPairs, documents } = JSON.parse(fs.readFileSync("model.json", "utf-8"));
const tfidf = new natural.TfIdf();
documents.forEach((doc) => tfidf.documents.push(doc));

function findBestAnswer(userQuery) {
  const query = userQuery.toLowerCase();
  const scores = [];

  tfidf.tfidfs(query, (i, measure) => {
    scores.push({ index: i, score: measure });
  });

  const best = scores.reduce(
    (a, b) => (a.score > b.score ? a : b),
    { index: 0, score: 0 }
  );

  const bestQuestion = qaPairs[best.index].question;
  const fuzzyScore = fuzzball.ratio(query, bestQuestion.toLowerCase());

  if (fuzzyScore > 20) {
    return qaPairs[best.index].answer;
  }
  return "Sorry, I couldn't find a relevant answer.";
}

app.post("/chat", async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "Question is required" });

  const answer = findBestAnswer(question);
  await ChatLog.create({ question, answer });

  res.json({ answer });
});

app.get("/health", (_, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
