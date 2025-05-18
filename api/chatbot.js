document.addEventListener("DOMContentLoaded", () => {
  console.log("🟢 chatbot.js chargé !");
  resetChatAfterInactivity();

  const chat = document.getElementById('chat-messages');
  const input = document.getElementById('chat-input');

  // 🔹 1. CHARGEMENT DE L’HISTORIQUE AU DÉMARRAGE
  const history = loadChatHistory();
  const currentPage = window.location.pathname;

if(chat){
  chat.innerHTML += `<div style="font-style: italic; color: #555;">🔎 Vous êtes sur la page : <strong>${currentPage}</strong></div>`;
}

  history.forEach(entry => {
    if (entry && entry.sender && entry.message) {
      chat.innerHTML += `<div><strong>${entry.sender}:</strong> ${entry.message}</div>`;
    }
  });
  if(chat){
  chat.scrollTop = chat.scrollHeight;
  }

  // 🔹 Bouton de réinitialisation du chat
  document.getElementById('reset-chat').addEventListener('click', () => {
    if (confirm("Souhaitez-vous vraiment réinitialiser la conversation ?")) {
      localStorage.removeItem('chatHistory');
      chat.innerHTML = `<div style="font-style: italic; color: gray;">💬 Le chat a été réinitialisé.</div>`;
    }
  });

  // 🔹 Toggle d'ouverture/fermeture du chat
  document.getElementById('toggle-chat').addEventListener('click', () => {
    const container = document.getElementById('chat-container');
    container.style.display = container.style.display === 'none' ? 'block' : 'none';
  });

  // 🔹 Envoi au clic ou à l’appui sur "Entrée"
  document.getElementById('send-button').addEventListener('click', sendChatMessage);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });

  // 🔹 Fonction d'envoi du message
  async function sendChatMessage() {
    const message = input.value.trim();
    if (!message) return;

    const sanitizedMessage = message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    chat.innerHTML += `<div><strong>Vous:</strong> ${sanitizedMessage}</div>`;
    input.value = '';

    // 🔹 Affiche un indicateur de "Assistant RH est en train de répondre..."
    chat.innerHTML += `<div id="typing"><em>Assistant RH est en train de répondre...</em></div>`;
    chat.scrollTop = chat.scrollHeight;

    try {
      const response = await fetch("https://red-cross-html-ipjz0lcxd-erdnaxams-projects.vercel.app/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message,
          page: window.location.pathname // <-- On envoie aussi le contexte
        })
      });

      const data = await response.json();

      // 🔹 Supprimer l'indicateur de typing une fois la réponse reçue
      document.getElementById('typing')?.remove();

      const botReply = data.reply.replace(/([\w-]+\.html)/g, '<a href="$1">$1</a>');
      chat.innerHTML += `<div><strong>Bot:</strong> ${botReply}</div>`;
      chat.scrollTop = chat.scrollHeight;

      // 🔹 Sauvegarde dans l’historique uniquement si tout est valide
      if (sanitizedMessage && data.reply) {
        let history = loadChatHistory();
        history.push({ sender: "Vous", message: sanitizedMessage });
        history.push({ sender: "Bot", message: data.reply });
        saveChatHistory(history);
      }

    } catch (error) {
      document.getElementById('typing')?.remove();
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

function resetChatAfterInactivity() {
  let timeout;

  const reset = () => {
    console.log("⏱️ Inactivité détectée : réinitialisation du chat.");
    localStorage.removeItem('chatHistory');
    document.getElementById('chat-messages').innerHTML = '';
  };

  const restartTimer = () => {
    clearTimeout(timeout);
    timeout = setTimeout(reset, 5 * 60 * 1000); // 5 minutes
  };

  ['click', 'keypress', 'mousemove', 'scroll'].forEach(event => {
    document.addEventListener(event, restartTimer);
  });

  restartTimer(); // Démarrage initial
}
