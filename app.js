
const form = document.getElementById("chat-form");
const input = document.getElementById("message");
const chat = document.getElementById("chat");
const statusText = document.getElementById("status");
const mic = document.getElementById("mic");

let history = [];

function addMessage(text, who) {
  const bubble = document.createElement("div");
  bubble.className = "bubble " + who;
  bubble.textContent = text;
  chat.appendChild(bubble);
  chat.scrollTop = chat.scrollHeight;
  return bubble;
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;

  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "bn-BD";
  utterance.rate = 1;
  speechSynthesis.speak(utterance);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = input.value.trim();
  if (!message) return;

  addMessage(message, "user");
  input.value = "";
  statusText.textContent = "EVA is thinking...";

  const thinking = addMessage("Thinking...", "eva");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history })
    });

    const data = await response.json();
    thinking.remove();

    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }

    const reply = data.reply || "I couldn't answer that.";
    addMessage(reply, "eva");

    history.push(
      { role: "user", content: message },
      { role: "assistant", content: reply }
    );

    if (history.length > 20) history = history.slice(-20);

    statusText.textContent = "EVA is ready";
    speak(reply);
  } catch (error) {
    thinking.textContent = "Connection error: " + error.message;
    statusText.textContent = "Please try again";
  }
});

mic.addEventListener("click", () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    statusText.textContent = "Voice input is not supported in this browser.";
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "bn-BD";
  recognition.interimResults = false;

  recognition.onstart = () => {
    statusText.textContent = "Listening...";
  };

  recognition.onresult = (event) => {
    input.value = event.results[0][0].transcript;
    statusText.textContent = "Message ready";
  };

  recognition.onerror = () => {
    statusText.textContent = "Could not hear you. Try again.";
  };

  recognition.onend = () => {
    if (statusText.textContent === "Listening...") {
      statusText.textContent = "EVA is ready";
    }
  };

  recognition.start();
});
