async function sendMessage() {
  const input = document.querySelector(".chat-window input");
  const userMessage = input.value.trim();
  if (!userMessage) return;

  input.value = "";

  document.querySelector(".chat").insertAdjacentHTML("beforeend", `
    <div class="user"><p>${userMessage}</p></div>
  `);

  const res = await fetch("http://localhost:3000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: userMessage,
      history: []
    })
  });

  const data = await res.json();

  document.querySelector(".chat").insertAdjacentHTML("beforeend", `
    <div class="model"><p>${data.reply}</p></div>
  `);
}
