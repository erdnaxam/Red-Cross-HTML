// test-chat.js
const { OpenAI } = require('openai/index.mjs');
require('dotenv').config(); // Charge ta clé API depuis .env

// Initialisation de l'API OpenAI avec ta clé
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Fonction principale
async function testPrompt() {
  const messages = [
    {
      role: 'system',
      content: 'Tu es un bot test. Commence toujours tes réponses par : [BOT TEST]'
    },
    {
      role: 'user',
      content: 'Salut, qui es-tu ?'
    }
  ];

  // Affichage des messages envoyés
  console.log("📤 Messages envoyés à OpenAI :", JSON.stringify(messages, null, 2));

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.7
    });

    console.log("\n✅ Réponse du bot :", response.choices[0].message.content);
  } catch (error) {
    console.error('❌ Erreur lors de l’appel à OpenAI:', error.message);
  }
}

testPrompt();
