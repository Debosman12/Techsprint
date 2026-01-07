/* ===================== CONFIG ===================== */

const BACKEND_URL = 'https://mindbridge-backend-ows5.onrender.com'; 

/* ===================== DOM ELEMENTS ===================== */

const chatToggle = document.getElementById('chatToggle');
const closeBtn = document.getElementById('closeBtn');
const chatWindow = document.getElementById('chatWindow');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const chatContainer = document.getElementById('chatContainer');
const welcomeText = document.getElementById('welcomeText');

const dashboardToggle = document.getElementById('dashboardToggle');
const dashboardClose = document.getElementById('dashboardClose');
const dashboard = document.getElementById('dashboard');
const chatLogs = document.getElementById('chatLogs');

const adaptiveToggle = document.getElementById('adaptiveToggle');
const voiceBtn = document.getElementById('voiceBtn');

/* ===================== STATE ===================== */

let adaptiveUIEnabled = false;
let currentChatHistory = [];
let chatSessions = JSON.parse(localStorage.getItem('chatSessions')) || [];

/* ===================== WELCOME TEXT ===================== */

window.addEventListener('DOMContentLoaded', () => {
    if (welcomeText) welcomeText.classList.add('show');
});

/* ===================== CHAT OPEN / CLOSE ===================== */

chatToggle.addEventListener('click', () => {
    chatWindow.classList.add('show');
    chatToggle.classList.add('hidden');
    userInput.focus();
});

closeBtn.addEventListener('click', () => {
    saveChatSession();
    chatWindow.classList.remove('show');
    chatToggle.classList.remove('hidden');

    if (welcomeText) {
        welcomeText.classList.remove('show');
        void welcomeText.offsetWidth; // force repaint
        welcomeText.classList.add('show');
    }
});

/* ===================== DASHBOARD ===================== */

dashboardToggle?.addEventListener('click', () => {
    dashboard.classList.add('show');
    renderChatLogs();
});

dashboardClose?.addEventListener('click', () => {
    dashboard.classList.remove('show');
});

function renderChatLogs() {
    if (!chatSessions.length) {
        chatLogs.innerHTML = `<p>No chat history yet.</p>`;
        return;
    }

    chatLogs.innerHTML = chatSessions.map(session => `
        <div class="chat-log-item">
            <strong>${session.date}</strong>
            <p>${session.preview}</p>
            <button onclick="viewChat(${session.id})">View</button>
            <button onclick="deleteChat(${session.id})">Delete</button>
        </div>
    `).join('');
}

window.viewChat = function (id) {
    const session = chatSessions.find(s => s.id === id);
    if (!session) return;

    chatContainer.innerHTML = '';
    session.messages.forEach(msg => addMessage(msg.content, msg.role === 'user'));

    dashboard.classList.remove('show');
    chatWindow.classList.add('show');
    chatToggle.classList.add('hidden');
};

window.deleteChat = function (id) {
    chatSessions = chatSessions.filter(s => s.id !== id);
    localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    renderChatLogs();
};

/* ===================== CHAT STORAGE ===================== */

function saveChatSession() {
    if (currentChatHistory.length < 2) return;

    const session = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        messages: [...currentChatHistory],
        preview: currentChatHistory[1]?.content || 'New Chat'
    };

    chatSessions.unshift(session);
    localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    currentChatHistory = [];
}

/* ===================== CHAT UI HELPERS ===================== */

function addMessage(message, isUser = false) {
    const div = document.createElement('div');
    div.className = isUser ? 'user' : 'model';

    const p = document.createElement('p');
    p.textContent = message;

    div.appendChild(p);
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    currentChatHistory.push({
        role: isUser ? 'user' : 'model',
        content: message
    });
}

function addError(message) {
    const div = document.createElement('div');
    div.className = 'error';
    div.textContent = message;
    chatContainer.appendChild(div);
}

function addTypingIndicator() {
    const div = document.createElement('div');
    div.id = 'typing';
    div.className = 'model typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    chatContainer.appendChild(div);
}

function removeTypingIndicator() {
    document.getElementById('typing')?.remove();
}

/* ===================== BACKEND COMMUNICATION ===================== */

async function sendMessageToBackend(message) {
    const res = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    });

    if (!res.ok) throw new Error('Backend error');
    const data = await res.json();
    return data.reply;
}

/* ===================== SEND MESSAGE ===================== */

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    if (adaptiveUIEnabled) {
        const emotion = detectEmotion(message);
        applyEmotionUI(emotion);
    }

    addMessage(message, true);
    userInput.value = '';
    addTypingIndicator();

    try {
        const reply = await sendMessageToBackend(message);
        removeTypingIndicator();
        addMessage(reply, false);
    } catch (err) {
        removeTypingIndicator();
        addError('Unable to connect to server.');
        console.error(err);
    }
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendMessage();
});

/* ===================== ADAPTIVE UI ===================== */

adaptiveToggle?.addEventListener('click', () => {
    adaptiveUIEnabled = !adaptiveUIEnabled;
    adaptiveToggle.classList.toggle('active', adaptiveUIEnabled);
});

function detectEmotion(text) {
    const t = text.toLowerCase();
    if (t.includes('sad') || t.includes('anxious')) return 'sad';
    if (t.includes('happy') || t.includes('good')) return 'happy';
    if (t.includes('angry')) return 'angry';
    return 'neutral';
}

function applyEmotionUI(emotion) {
    const root = document.documentElement;
    const colors = {
        happy: '#e6f7f1',
        sad: '#eef2ff',
        angry: '#fff1f2',
        neutral: '#f8f9fa'
    };
    root.style.setProperty('--bg-gradient', colors[emotion] || colors.neutral);
}

/* ===================== VOICE MODE ===================== */

let recognition;
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = e => {
        userInput.value = e.results[0][0].transcript;
    };

    recognition.onend = () => {
        voiceBtn?.classList.remove('listening');
    };
}

voiceBtn?.addEventListener('click', () => {
    if (!recognition) return alert('Voice not supported');
    voiceBtn.classList.add('listening');
    recognition.start();
});
