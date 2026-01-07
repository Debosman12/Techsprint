const BACKEND_URL = 'https://mindbridge-backend-ows5.onrender.com';
async function sendMessageToBackend(message) {
    const res = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    });

    const data = await res.json();
    return data.reply;
}
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

// State variables
let currentChatHistory = [];
let chatSessions = JSON.parse(localStorage.getItem('chatSessions')) || [];
let adaptiveUIEnabled = localStorage.getItem('adaptiveUI') !== 'false';

/* -------------------- INITIALIZATION -------------------- */
function init() {
    currentChatHistory = [];
    if (welcomeText) {
        welcomeText.animate(
            [{ opacity: 0 }, { opacity: 1 }],
            { duration: 2000, easing: 'ease-in-out', fill: 'forwards' }
        );
    }
}
init();

/* -------------------- UI TOGGLES -------------------- */
chatToggle.addEventListener('click', () => {
    chatWindow.classList.add('show');
    chatToggle.classList.add('hidden');
    userInput.focus();
    if(welcomeText) welcomeText.style.display = 'none';
});

closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    chatWindow.classList.remove('show');
    chatToggle.classList.remove('hidden');
    saveChatSession();
    if (welcomeText) {
        welcomeText.style.display = 'block';
        welcomeText.animate(
            [{ opacity: 0 }, { opacity: 1 }],
            { duration: 1000, fill: 'forwards' }
        );
    }
});

/* -------------------- DASHBOARD TOGGLE -------------------- */
dashboardToggle.addEventListener('click', () => {
    dashboard.classList.add('show');
    renderChatLogs();
});

dashboardClose.addEventListener('click', () => {
    dashboard.classList.remove('show');
});

/* -------------------- ADAPTIVE UI -------------------- */
const adaptiveToggle = document.getElementById('adaptiveToggle');
if (adaptiveToggle) {
    adaptiveToggle.checked = adaptiveUIEnabled;
    adaptiveToggle.addEventListener('change', () => {
        adaptiveUIEnabled = adaptiveToggle.checked;
        localStorage.setItem('adaptiveUI', adaptiveUIEnabled);
        if (!adaptiveUIEnabled) applyEmotionUI('calm');
    });
}

function detectEmotion(text) {
    const t = text.toLowerCase();
    
    // Anxiety Triggers
    if (t.includes('anxious') || t.includes('nervous') || t.includes('worried') || t.includes('panic') || t.includes('fear') || t.includes('scared')) {
        return 'anxiety';
    }
    
    // Stress/Depression Triggers
    if (t.includes('stressed') || t.includes('overwhelmed') || t.includes('pressure') || t.includes('burnt out') || t.includes('tired') || t.includes('sad')) {
        return 'stress';
    }
    
    return 'calm';
}

function applyEmotionUI(emotion) {
    const root = document.documentElement;
    console.log("Applying Emotion UI:", emotion); // Debugging log

    switch (emotion) {
        case 'anxiety':
            // Calming Blue/Teal Gradient
            root.style.setProperty('--bg-gradient', 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)');
            break;
        case 'stress':
            // Soothing Grey/Lavender Gradient
            root.style.setProperty('--bg-gradient', 'linear-gradient(135deg, #a8c0ff, #3f2b96)');
            break;
        default:
            // Default Purple/Blue Gradient
            root.style.setProperty('--bg-gradient', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
    }
}

/* -------------------- CHAT LOGIC -------------------- */
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
        const res = await fetch('http://localhost:3000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                history: currentChatHistory.map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }]
                }))
            })
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data = await res.json();
        removeTypingIndicator();
        addMessage(data.reply, false);

    } catch (err) {
        removeTypingIndicator();
        addError('Server connection failed. Is the backend running?');
        console.error(err);
    }
}

/* -------------------- UI HELPERS -------------------- */
function addMessage(text, isUser = false) {
    const div = document.createElement('div');
    div.className = isUser ? 'user' : 'model';
    const p = document.createElement('p');
    p.textContent = text;
    div.appendChild(p);
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    currentChatHistory.push({ role: isUser ? 'user' : 'model', content: text });
}

function addError(text) {
    const div = document.createElement('div');
    div.className = 'error';
    div.innerHTML = `<p>⚠️ ${text}</p>`;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function addTypingIndicator() {
    const div = document.createElement('div');
    div.className = 'model';
    div.id = 'typing';
    div.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function removeTypingIndicator() {
    const typing = document.getElementById('typing');
    if (typing) typing.remove();
}

/* -------------------- HISTORY & STORAGE -------------------- */
function saveChatSession() {
    if (currentChatHistory.length > 0) {
        const session = {
            id: Date.now(),
            date: new Date().toLocaleString(),
            messages: [...currentChatHistory],
            preview: currentChatHistory[0].content || 'New Chat'
        };
        chatSessions.unshift(session);
        localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    }
}

function renderChatLogs() {
    if (chatSessions.length === 0) {
        chatLogs.innerHTML = `<div class="empty-state"><p>No history yet.</p></div>`;
        return;
    }
    chatLogs.innerHTML = chatSessions.map(session => `
        <div class="chat-log-item">
            <div class="chat-log-header">
                <span class="chat-log-title">Session</span>
                <span class="chat-log-date">${session.date}</span>
            </div>
            <div class="chat-log-preview">${session.preview.substring(0, 40)}...</div>
            <div class="chat-log-actions">
                <button onclick="loadSession(${session.id})">View</button>
                <button class="delete" onclick="deleteSession(${session.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

window.loadSession = function(id) {
    const session = chatSessions.find(s => s.id === id);
    if (!session) return;
    chatContainer.innerHTML = '<div class="model"><p>Hi, how can I help you today? 👋</p></div>';
    currentChatHistory = [];
    session.messages.forEach(msg => addMessage(msg.content, msg.role === 'user'));
    dashboard.classList.remove('show');
    chatWindow.classList.add('show');
    chatToggle.classList.add('hidden');
};

window.deleteSession = function(id) {
    chatSessions = chatSessions.filter(s => s.id !== id);
    localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    renderChatLogs();
};

const clearChatsBtn = document.getElementById('clearChatsBtn');
if(clearChatsBtn) {
    clearChatsBtn.addEventListener('click', () => {
        if(confirm('Clear all history?')) {
            chatSessions = [];
            localStorage.removeItem('chatSessions');
            renderChatLogs();
        }
    });
}

/* -------------------- EVENT LISTENERS -------------------- */
sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

/* -------------------- VOICE RECOGNITION -------------------- */
if (voiceBtn) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = false;

        recognition.onstart = () => {
            console.log("Voice recognition started");
            voiceBtn.classList.add('listening');
        };

        recognition.onend = () => {
            console.log("Voice recognition ended");
            voiceBtn.classList.remove('listening');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log("Heard:", transcript);
            userInput.value = transcript;
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            voiceBtn.classList.remove('listening');
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
                alert("Microphone access error: " + event.error);
            }
        };

        voiceBtn.addEventListener('click', () => {
            try {
                recognition.start();
            } catch (err) {
                console.error("Failed to start recognition:", err);
            }
        });
    } else {
        console.warn("Speech Recognition API not supported in this browser.");
        voiceBtn.style.display = 'none';
    }
}
