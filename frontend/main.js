// Chat history to maintain conversation context
let chatHistory = [];

// DOM elements
const chatWindow = document.querySelector(".chat-window");
const chatButton = document.querySelector(".chat-button");
const closeButton = document.querySelector(".close");
const inputField = document.querySelector(".chat-window input");
const sendButton = document.querySelector(".chat-window button");
const chatContainer = document.querySelector(".chat");

// Toggle chat window
// We switch the classes on the specific elements rather than the body
chatButton.addEventListener("click", () => {
  chatWindow.classList.add("show");
  chatButton.classList.add("hidden");
  inputField.focus(); // Auto-focus input when opened
});

closeButton.addEventListener("click", () => {
  chatWindow.classList.remove("show");
  chatButton.classList.remove("hidden");
});

// Send message function
async function sendMessage() {
  const userMessage = inputField.value.trim();
  if (!userMessage) return;

  // Clear input
  inputField.value = "";

  // Add user message to chat
  chatContainer.insertAdjacentHTML("beforeend", `
    <div class="user"><p>${escapeHtml(userMessage)}</p></div>
  `);

  // Add loading indicator
  chatContainer.insertAdjacentHTML("beforeend", `
    <div class="model loading-message">
      <div class="loader"></div>
    </div>
  `);

  // Scroll to bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;

  try {
    const res = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userMessage,
        history: chatHistory
      })
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    // Remove loading indicator
    const loadingMessage = chatContainer.querySelector(".loading-message");
    if (loadingMessage) {
      loadingMessage.remove();
    }

    // Add AI response to chat
    chatContainer.insertAdjacentHTML("beforeend", `
      <div class="model"><p>${escapeHtml(data.reply)}</p></div>
    `);

    // Update chat history
    chatHistory.push(
      { role: "user", parts: [{ text: userMessage }] },
      { role: "model", parts: [{ text: data.reply }] }
    );

  } catch (error) {
    console.error("Error:", error);
    
    // Remove loading indicator
    const loadingMessage = chatContainer.querySelector(".loading-message");
    if (loadingMessage) {
      loadingMessage.remove();
    }

    // Show error message
    chatContainer.insertAdjacentHTML("beforeend", `
      <div class="error"><p>Sorry, I couldn't process your message. Please make sure the server is running and try again.</p></div>
    `);
  }

  // Scroll to bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Helper function to escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Send message on button click
sendButton.addEventListener("click", sendMessage);

// Send message on Enter key
inputField.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});