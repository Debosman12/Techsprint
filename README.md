# 🧠 Mindbridge (TechSprint)

**Mindbridge** is an AI-powered mental health companion designed to provide a safe space for users to express their feelings. Powered by Google Gemini, it features an adaptive interface that changes based on emotional context, voice-to-text capabilities, and secure local chat history.

![Status](https://img.shields.io/badge/Status-Active-success)
![Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20Express%20%7C%20Gemini-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Key Features

* **🤖 Serenbot AI:** A fine-tuned system prompt running on `gemini-2.5-flash` that acts as a supportive listener, offering coping strategies while adhering to safety guardrails.
* **🎨 Adaptive UI:** The application detects keywords (e.g., "anxiety", "stress") and dynamically changes the background gradients to soothing colors to match the user's emotional state.
* **🎙️ Voice Interaction:** Integrated Web Speech API allows users to speak their thoughts instead of typing.
* **📖 Dashboard & History:** Chat sessions are saved locally in the browser (`localStorage`), ensuring privacy while allowing users to review past conversations via a slide-out dashboard.
* **🛡️ Crisis Escalation:** The AI is programmed to recognize distress levels (Mild, Moderate, High) and provide appropriate disclaimers or resource suggestions.

---

## 📂 Project Structure

Based on your current configuration:

```text
TECHSPRINT/
├── backend/
│   ├── node_modules/
│   ├── package.json
│   ├── package-lock.json
│   └── server.mjs        # Express Server & Gemini Logic
├── frontend/
│   ├── chat-icon.png
│   ├── index.html        # Main Entry Point
│   ├── main.js           # Frontend Logic (Voice, UI, API calls)
│   ├── micicon1.png
│   ├── send-icon.png
│   └── style.css         # Styling & Animations
├── .env                  # API Key Configuration
└── README.md
