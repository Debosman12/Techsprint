#Mindbridge - AI Mental Health Assistant

Mindbridge is an AI-powered mental health support chatbot designed to provide empathetic, non-judgmental conversations. Built with Node.js and Google's Gemini 2.5 Flash model, it offers a safe space for users to express their feelings, explore coping strategies, and receive grounding techniques.

Key Features:

-Empathetic AI Persona: Powered by Google Gemini 2.5 Flash, tuned to be supportive, validating, and safety-conscious.
-Adaptive UI: The interface color theme dynamically changes based on the user's detected emotion (e.g., calming blue for anxiety, soothing purple for stress).
-Voice Recognition: Integrated Web Speech API allows users to speak directly to the assistant instead of typing.
-Secure Backend: API keys are protected server-side using a Node.js Express backend, preventing exposure in the browser.
-Chat History: Locally saved conversation history lets users revisit past sessions.
-Safety First: Includes strict escalation protocols for crisis situations and a prominent disclaimer that it is not a replacement for professional help.

Tech Stack:

-Frontend: HTML5, CSS3 (responsive), Vanilla JavaScript
-Backend: Node.js, Express.js
-AI Model: Google Gemini 2.5 Flash (via Google Generative AI SDK)
-Browser APIs: Web Speech API (SpeechRecognition), LocalStorage