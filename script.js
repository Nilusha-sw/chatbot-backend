const API_URL = "http://localhost:8000"; 

const chatBody = document.getElementById("chat-body");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");

function appendMessage(sender, text) {
  const div = document.createElement("div");
  div.classList.add("message", sender === "user" ? "user-message" : "bot-message");
  div.innerHTML = `<p>${text}</p>`;
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight; 
}

function showTyping() {
  const div = document.createElement("div");
  div.classList.add("message", "bot-message");
  div.id = "typing-indicator";
  div.innerHTML = `<p>Typing...</p>`;
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function hideTyping() {
  const el = document.getElementById("typing-indicator");
  if (el) el.remove();
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const question = userInput.value.trim();
  if (!question) return;

  userInput.value = "";
  appendMessage("user", question);
  showTyping();

  try {
    const res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    hideTyping();
    appendMessage("bot", data.answer);
  } catch (err) {
    hideTyping();
    appendMessage("bot", "Woof! Something went wrong. Please try again!");
  }
});
