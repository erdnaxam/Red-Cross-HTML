require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

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
    console.error('Erreur OpenAI:', error);
    res.status(500).json({ error: 'Erreur lors de la génération de la lettre.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Backend prêt sur http://localhost:${PORT}`));
