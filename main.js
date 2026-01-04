import { GoogleGenerativeAI } from 'https://esm.run/@google/generative-ai';

// UI elements
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
const voiceBtn = document.getElementById('voiceBtn');

// 🔑 Replace with your actual API key
const API_KEY = 'YOUR_API_KEY_HERE';

// Gemini setup
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

let chat;
let currentChatHistory = [];
let chatSessions = JSON.parse(localStorage.getItem('chatSessions')) || [];

/* -------------------- CHAT INIT -------------------- */
function initChat() {
    chat = model.startChat({
        history: [],
        generationConfig: {
            maxOutputTokens: 1000,
        },
    });

    currentChatHistory = [{
        role: 'model',
        content: 'Hi, how can I help you today? 👋'
    }];
}

initChat();

/* -------------------- UI TOGGLES -------------------- */
chatToggle.addEventListener('click', () => {
    chatWindow.classList.add('show');
    chatToggle.classList.add('hidden');
    userInput.focus();
    welcomeText?.remove();
});

document.addEventListener('DOMContentLoaded', () => {
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (!welcomeMessage) return;

    // Ensure initial hidden state is painted
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            welcomeMessage.classList.add('show');
        });
    });
});

window.addEventListener('load', () => {
    const welcome = document.getElementById('welcomeText');
    if (!welcome) return;

    welcome.animate(
        [
            { opacity: 0 },
            { opacity: 1 }
        ],
        {
            duration: 2000,
            easing: 'ease-in-out',
            fill: 'forwards'
        }
    );
});

function showWelcome() {
    if (!welcomeText) return;

    welcomeText.style.display = 'block';
    welcomeText.style.opacity = '0';

    welcomeText.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        {
            duration: 2000,
            easing: 'ease-in-out',
            fill: 'forwards'
        }
    );
}

/* -------------------- DASHBOARD TOGGLE -------------------- */
dashboardToggle.addEventListener('click', () => {
    dashboard.classList.add('show');
    renderChatLogs();
});

dashboardClose.addEventListener('click', () => {
    dashboard.classList.remove('show');
});

const adaptiveToggle = document.getElementById('adaptiveToggle');

// Load saved preference
let adaptiveUIEnabled = localStorage.getItem('adaptiveUI') !== 'false';

// Apply saved state
adaptiveToggle.checked = adaptiveUIEnabled;

adaptiveToggle.addEventListener('change', () => {
    adaptiveUIEnabled = adaptiveToggle.checked;
    localStorage.setItem('adaptiveUI', adaptiveUIEnabled);

    // If turned OFF → reset to calm UI
    if (!adaptiveUIEnabled) {
        applyEmotionUI('calm');
    }
});

/* -------------------- EMOTION DETECTION -------------------- */
function detectEmotion(text) {
    const t = text.toLowerCase();

    if (
        t.includes('anxious') ||
        t.includes('nervous') ||
        t.includes('worried') ||
        t.includes('panic') ||
        t.includes('scared')
    ) {
        return 'anxiety';
    }

    if (
        t.includes('stressed') ||
        t.includes('overwhelmed') ||
        t.includes('pressure') ||
        t.includes('burnt out')
    ) {
        return 'stress';
    }

    return 'calm';
}

function applyEmotionUI(emotion) {
    const root = document.documentElement;

    switch (emotion) {
        case 'anxiety':
            root.style.setProperty(
                '--bg-gradient',
                'linear-gradient(135deg, #4facfe, #00c6ff)'
            );
            root.style.setProperty('--bubble-model', '#e3f2fd');
            root.style.setProperty(
                '--bubble-user',
                'linear-gradient(135deg, #4facfe, #00c6ff)'
            );
            root.style.setProperty('--mic-glow', 'rgba(79, 172, 254, 0.8)');
            break;

        case 'stress':
            root.style.setProperty(
                '--bg-gradient',
                'linear-gradient(135deg, #757f9a, #d7dde8)'
            );
            root.style.setProperty('--bubble-model', '#f0f0f0');
            root.style.setProperty(
                '--bubble-user',
                'linear-gradient(135deg, #757f9a, #d7dde8)'
            );
            root.style.setProperty('--mic-glow', 'rgba(120, 120, 120, 0.6)');
            break;

        default: // calm
            root.style.setProperty(
                '--bg-gradient',
                'linear-gradient(135deg, #667eea, #764ba2)'
            );
            root.style.setProperty('--bubble-model', '#e5e9f2');
            root.style.setProperty(
                '--bubble-user',
                'linear-gradient(135deg, #667eea, #764ba2)'
            );
            root.style.setProperty('--mic-glow', 'rgba(102, 126, 234, 0.6)');
    }
}

/* -------------------- CHAT STORAGE -------------------- */
function saveChatSession() {
    if (currentChatHistory.length > 1) {
        const session = {
            id: Date.now(),
            date: new Date().toLocaleString(),
            messages: currentChatHistory,
            preview: currentChatHistory[1]?.content || 'New chat'
        };

        chatSessions.unshift(session);
        localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    }
}

function renderChatLogs() {
    if (chatSessions.length === 0) {
        chatLogs.innerHTML = `
            <div class="empty-state">
                <p>No chat history yet.<br>Start a conversation to see it here!</p>
            </div>
        `;
        return;
    }

    chatLogs.innerHTML = chatSessions.map(session => `
        <div class="chat-log-item">
            <div class="chat-log-header">
                <span class="chat-log-title">Chat Session</span>
                <span class="chat-log-date">${session.date}</span>
            </div>
            <div class="chat-log-preview">${session.preview.substring(0, 60)}...</div>
            <div class="chat-log-actions">
                <button onclick="viewChat(${session.id})">View</button>
                <button class="delete" onclick="deleteChat(${session.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

window.viewChat = function (id) {
    const session = chatSessions.find(s => s.id === id);
    if (!session) return;

    chatContainer.innerHTML = '';
    session.messages.forEach(msg => {
        const div = document.createElement('div');
        div.className = msg.role === 'user' ? 'user' : 'model';

        const p = document.createElement('p');
        p.textContent = msg.content;

        div.appendChild(p);
        chatContainer.appendChild(div);
    });

    dashboard.classList.remove('show');
    chatWindow.classList.add('show');
    chatToggle.classList.add('hidden');
};

window.deleteChat = function (id) {
    chatSessions = chatSessions.filter(s => s.id !== id);
    localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    renderChatLogs();
};

const clearChatsBtn = document.getElementById('clearChatsBtn');

clearChatsBtn.addEventListener('click', () => {
    const confirmClear = confirm(
        'Are you sure you want to delete all chat history? This cannot be undone.'
    );

    if (!confirmClear) return;

    // Clear storage
    chatSessions = [];
    localStorage.removeItem('chatSessions');

    // Clear UI
    chatLogs.innerHTML = `
        <div class="empty-state">
            <p>No chat history yet.<br>Start a conversation to see it here!</p>
        </div>
    `;

    // Optional: reset current chat
    if (window.currentChatHistory) {
        window.currentChatHistory.length = 0;
    }
});

/* -------------------- CHAT UI HELPERS -------------------- */
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

    const p = document.createElement('p');
    p.textContent = '⚠️ ' + message;

    div.appendChild(p);
    chatContainer.appendChild(div);
}

function addTypingIndicator() {
    const div = document.createElement('div');
    div.className = 'model';
    div.id = 'typing';

    div.innerHTML = `
        <div class="typing-indicator">
            <span></span><span></span><span></span>
        </div>
    `;

    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function removeTypingIndicator() {
    document.getElementById('typing')?.remove();
}

/* -------------------- TEXT TO SPEECH -------------------- */
function speak(text) {
    if (!window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
}

/* -------------------- VOICE INPUT -------------------- */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition;

if (SpeechRecognition && voiceBtn) {
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;

    recognition.onstart = () => {
        voiceBtn.classList.add('listening');
    };

    recognition.onend = () => {
        voiceBtn.classList.remove('listening');
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        sendMessage();
    };

    voiceBtn.addEventListener('click', () => recognition.start());
}

/* -------------------- SEND MESSAGE -------------------- */
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
        if (API_KEY === 'YOUR_API_KEY_HERE') {
            removeTypingIndicator();
            addError('Please add your Google API key.');
            return;
        }

        const result = await chat.sendMessage(message);
        const response = result.response.text();

        removeTypingIndicator();
        addMessage(response);
    } catch (err) {
        removeTypingIndicator();
        addError('Something went wrong. Please try again.');
        console.error(err);
    }
}

/* -------------------- CHAT CLOSE HANDLER -------------------- */
const closeBtnSafe = document.getElementById('closeBtn');
const chatWindowSafe = document.getElementById('chatWindow');
const chatToggleSafe = document.getElementById('chatToggle');
const welcomeTextSafe = document.getElementById('welcomeText');

if (closeBtnSafe) {
    closeBtnSafe.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();

        console.log('✅ Chat closed & saving session');

        // Save chat before closing
        if (typeof saveChatSession === 'function') {
            saveChatSession();
        }

        // Close chat UI
        if (chatWindowSafe) {
            chatWindowSafe.classList.remove('show');
        }

        if (chatToggleSafe) {
            chatToggleSafe.classList.remove('hidden');
        }

        // Show welcome text again
        if (welcomeTextSafe) {
            welcomeTextSafe.classList.remove('show');
            void welcomeTextSafe.offsetWidth;
            welcomeTextSafe.classList.add('show');
        }
    };
}

closeBtn.addEventListener('click', () => {
    if (!welcomeText) return;

    // Force reflow so fade-in triggers
    welcomeText.classList.remove('show');
    void welcomeText.offsetWidth;
    welcomeText.classList.add('show');
});

/* -------------------- EVENT LISTENERS -------------------- */
sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
