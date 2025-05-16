// chatbot.js
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById('toggle-chat').addEventListener('click', () => {
    const container = document.getElementById('chat-container');
    container.style.display = container.style.display === 'none' ? 'block' : 'none';
  });
console.log("🟢 chatbot.js chargé !");

  document.getElementById('send-button').addEventListener('click', sendChatMessage);

  async function sendChatMessage() {
    
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    const chat = document.getElementById('chat-messages');
    chat.innerHTML += `<div><strong>Vous:</strong> ${message}</div>`;
    input.value = '';

    try {
      const response = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })

      });

      const data = await response.json();
    chat.innerHTML += `<div><strong>Bot:</strong> ${data.reply.replace(/([\w-]+\.html)/g, '<a href="$1">$1</a>')}</div>`;
      chat.scrollTop = chat.scrollHeight;
    } catch (error) {
      chat.innerHTML += `<div style="color:red;"><strong>Erreur:</strong> ${error.message}</div>`;
    }
  }
});
function saveChatHistory(history) {
  localStorage.setItem('chatHistory', JSON.stringify(history));
}
function loadChatHistory() {
  const stored = localStorage.getItem('chatHistory');
  return stored ? JSON.parse(stored) : [];
}
