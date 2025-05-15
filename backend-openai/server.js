require('dotenv').config(); // adapter le chemin si nécessaire

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');

const app = express();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

/* === Route 1 : Chat simple === */
app.post('/api/chat', async (req, res) => {
  console.log("✅ Route POST /api/chat appelée");

  const userMessage = req.body.message;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: userMessage }],
    });

    const botReply = completion.choices[0].message.content;
    res.json({ reply: botReply });
  } catch (error) {
    console.error('❌ Erreur OpenAI (chat):', error.message);
    res.status(500).json({ reply: 'Erreur serveur chatbot.' });
  }
});

/* === Route 2 : Génération de lettre de motivation === */
app.post('/api/generer-lettre', async (req, res) => {
  const { nom, email, poste, entreprise, motivation_poste, valeur_ajoutee } = req.body;

  const prompt = `Rédige une lettre de motivation pour ${nom} qui postule au poste de ${poste} chez ${entreprise}.
Motivation : ${motivation_poste}.
Ce qu'il/elle peut apporter : ${valeur_ajoutee}.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: "system", content: "Tu es un assistant RH qui rédige des lettres de motivation professionnelles." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });

    res.json({ text: completion.choices[0].message.content });
  } catch (error) {
    console.error('❌ Erreur OpenAI (lettre):', error.message);
    res.status(500).json({ error: 'Erreur lors de la génération de la lettre.' });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur backend démarré sur http://localhost:${PORT}`);
});
