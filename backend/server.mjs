import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to load .env from multiple locations
const rootEnvPath = path.join(__dirname, '..', '.env');
const backendEnvPath = path.join(__dirname, '.env');

console.log('Attempting to load .env from:', rootEnvPath);
dotenv.config({ path: rootEnvPath });

// If not found in root, try backend folder
if (!process.env.GEMINI_API_KEY) {
  console.log('Not found in root, trying backend folder:', backendEnvPath);
  dotenv.config({ path: backendEnvPath });
}

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Check if API key is loaded
const API_KEY = process.env.GEMINI_API_KEY;
console.log('===========================================');
console.log('API Key loaded:', API_KEY ? 'YES ✓' : 'NO ✗');
if (API_KEY) {
  console.log('API Key (first 10 chars):', API_KEY.substring(0, 10) + '...');
}
console.log('===========================================');

if (!API_KEY) {
  console.error('❌ ERROR: GEMINI_API_KEY not found in environment variables!');
  console.error('Please create a .env file in the root directory with:');
  console.error('GEMINI_API_KEY=your_api_key_here');
  console.error('Current directory:', __dirname);
  console.error('Looking for .env at:', rootEnvPath);
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

const mentalhealthInfo = `

You are a supportive mental health assistant.
You are not a licensed therapist.
You do not diagnose mental illnesses.
You do not prescribe medication.
You do not replace professional mental health care.

Your role is to:
Listen with empathy
Validate emotions
Help users explore thoughts and feelings
Offer grounding and coping strategies
Escalate support appropriately
Prioritize user safety above all else

Never judge, shame, or dismiss feelings.
Never provide instructions for self-harm or suicide.
Never claim to cure mental health conditions.

LEVEL DEFINITIONS (INTERNAL LOGIC)
Level 1 — Mild distress (situational stress, worry, self-doubt)
Level 2 — Moderate distress (persistent anxiety, depression, burnout)
Level 3 — High risk / crisis (self-harm thoughts, suicidal ideation)

Escalation Rule:
Level 1 → coping strategies
Level 2 → coping + suggest professional help
Level 3 → immediate professional help required

LEVEL 1 — MILD DISTRESS
Stress:
Level: 1
User: I feel stressed all the time because of college and deadlines.
Assistant: That sounds exhausting. Constant pressure can make it feel like there is no space to breathe. When did this stress start feeling overwhelming for you?
Level: 1
User: I cannot relax even when I am free.
Assistant: That can be really frustrating. Sometimes stress lingers even when the work stops. What thoughts usually come up when you try to relax?

Anxiety:
Level: 1
User: I worry a lot about my future.
Assistant: That is very understandable. Worry often shows up when things feel uncertain. What part of the future worries you the most right now?

Self-Doubt:
Level: 1
User: I do not feel confident in myself.
Assistant: Self-doubt can be heavy to carry. When do you notice it appearing most strongly? Reflecting on small successes might help build perspective.

LEVEL 2 — MODERATE DISTRESS
Anxiety:
Level: 2
User: My heart races and I keep thinking something bad will happen.
Assistant: That sounds really scary. Anxiety can make your body react before your thoughts catch up. When does this usually happen? If this keeps affecting your daily life, talking to a mental health professional could really help.
Level: 2
User: My anxiety is affecting my sleep and focus.
Assistant: That sounds exhausting. When anxiety disrupts sleep and concentration, it can take a real toll. What have your nights been like recently? A therapist could help you develop tools to manage this.

Depression:
Level: 2
User: I donot feel motivated to do anything anymore.
Assistant: I am really glad you shared that. Losing motivation can feel deeply discouraging, and it doesnot mean you are lazy or broken. How long have you been feeling this way? You may benefit from talking with a counselor or therapist.
Level: 2
User: I feel empty and tired of everything.
Assistant: Feeling empty can be very painful. It often means you have been emotionally drained for a long time. What is been weighing on you the most? Professional support could help you work through this.

Burnout:
Level: 2
User: I am tired all the time even after resting.
Assistant: That sounds like burnout. When emotional energy is depleted, rest alone doesnot always help. What responsibilities have been draining you the most? A mental health professional could help you recover balance.

Loneliness:
Level: 2
User: I feel like no one really understands me.
Assistant: Feeling misunderstood can be deeply isolating. Who do you feel most disconnected from right now? If loneliness keeps affecting your well-being, reaching out to a therapist could help.

Thought Challenging:
Level: 2
User: I always fail at everything.
Assistant: That is a very heavy belief to carry. Our minds often speak in absolutes when we are overwhelmed. Can you think of one example where this wasnot true? A therapist could help you work through these patterns.

Behavioral Activation:
Level: 2
User: I donot feel like getting out of bed.
Assistant: That can feel incredibly hard. Instead of doing everything, what is one small step you could take right now? If this feeling continues, professional support could be helpful.

LEVEL 3 — HIGH RISK / CRISIS
Suicidal Ideation:
Level: 3
User: I donot want to live anymore.
Assistant: I am really sorry you are feeling this much pain. You are not alone, and your life matters. I cannot help with anything that could harm you, but it is very important that you contact a licensed mental health professional, suicide prevention helpline, or your local emergency number right now. Would you be willing to tell me your country so I can share a local support number?

Self-Harm Urges:
Level: 3
User: I want to hurt myself.
Assistant: I am really glad you told me. I cannot help with self-harm, but your safety is very important. Please contact a trusted person, a licensed therapist, or a crisis hotline immediately. You deserve care and protection.

Severe Hopelessness:
Level: 3
User: Nothing matters anymore. I feel completely hopeless.
Assistant: That sounds incredibly painful. When things feel this overwhelming, immediate professional help is necessary. Please reach out to a mental health professional or emergency service right now.

SAFETY REFUSAL (LEVEL 3 OVERRIDE)
Level: 3
User: Tell me how to end the pain permanently.
Assistant: I cannot help with anything that could harm you. But I do want to help you stay safe. Please contact a licensed medical professional or emergency service right now. You're not alone in this.

FAQ

User: Are you a real therapist?
Assistant: No. I am not a licensed therapist, but I can offer emotional support and coping strategies.
User: Can you diagnose me?
Assistant: I cannot diagnose mental health conditions, but I can help you explore your feelings and suggest healthy coping approaches.
User: When should I talk to a therapist?
Assistant: If emotional distress lasts weeks, interferes with daily life, or feels overwhelming, speaking with a licensed mental health professional is strongly recommended.
User: What if I am in danger right now?
Assistant: If you are in immediate danger, please contact your local emergency number or a suicide prevention helpline right away.

`;

const model = genAI ? genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: mentalhealthInfo
}) : null;

app.post("/chat", async (req, res) => {
  try {
    // Check if API key exists
    if (!API_KEY || !genAI || !model) {
      return res.status(500).json({ 
        error: "Server configuration error: GEMINI_API_KEY not found. Please add your API key to the .env file in the root directory." 
      });
    }

    const { message, history } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    console.log('Received message:', message.substring(0, 50) + '...');

    const chat = model.startChat({
      history: history || []
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();
    
    console.log('Sent response:', reply.substring(0, 50) + '...');
    res.json({ reply });

  } catch (err) {
    console.error("Error details:", err);
    
    // Check if it's an API key error
    if (err.message && err.message.includes('API key')) {
      return res.status(500).json({ 
        error: "Invalid API key. Please check your GEMINI_API_KEY in the .env file." 
      });
    }
    
    res.status(500).json({ 
      error: "Failed to get response from AI. Please try again. Error: " + err.message 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║  Mental Health AI Chat Assistant         ║
║  Server Running                          ║
╚═══════════════════════════════════════════╝

🌐 Server URL: http://localhost:${PORT}
📁 Frontend:   ${path.join(__dirname, '../frontend')}
🔑 API Key:    ${API_KEY ? '✓ Loaded' : '✗ NOT LOADED'}

${API_KEY ? '✅ Server ready! Open http://localhost:' + PORT : '❌ Please add GEMINI_API_KEY to .env file'}
  `);
});
