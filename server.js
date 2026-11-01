
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "API key is not configured."
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: process.env.AI_MODEL || "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are EVA AI, a friendly voice assistant. Reply in Bangla when the user speaks Bangla."
            },
            ...history,
            { role: "user", content: message }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "AI request failed."
      });
    }

    res.json({
      reply: data.choices?.[0]?.message?.content || "No reply received."
    });
  } catch (error) {
    res.status(500).json({ error: "Server error." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`EVA AI running on port ${PORT}`));
