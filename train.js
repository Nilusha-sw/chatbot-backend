const fs = require("fs");
const natural = require("natural");

const tfidf = new natural.TfIdf();
const lines = fs.readFileSync("dataset.txt", "utf-8").split("\n");
const qaPairs = [];

for (const line of lines) {
  const parts = line.split("?");
  if (parts.length > 1) {
    const question = parts[0].trim() + "?";
    const answer = parts.slice(1).join("?").trim();
    if (question && answer) {
      qaPairs.push({ question, answer });
      tfidf.addDocument(question.toLowerCase());
    }
  }
}

const model = {
  qaPairs,
  documents: tfidf.documents,
};

fs.writeFileSync("model.json", JSON.stringify(model, null, 2));
console.log(`✅ Model trained with ${qaPairs.length} Q&A pairs → model.json`);