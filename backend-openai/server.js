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
function getSystemPrompt(lang) {
  switch (lang) {
    case "en":
      return "You are the official assistant of EmploiAvenir, a French platform that helps vulnerable people find jobs. Respond in simple, clear English. Start all your answers with: [HR Assistant]";
    case "ar":
      return "أنت المساعد الرسمي لمنصة EmploiAvenir التي تساعد الأشخاص في العثور على وظيفة. رد بلغة عربية واضحة وبسيطة، وابدأ كل إجابة بـ: [المساعد المهني]";
    case "uk":
      return "Ви офіційний чат-асистент платформи EmploiAvenir. Допоможіть користувачам знайти роботу українською мовою. Починайте всі відповіді з: [HR Помічник]";
    default:
      return "Tu es le chatbot officiel d'EmploiAvenir. Aide les utilisateurs en français simple. Commence toujours par : [Assistant RH]";
  }
}

/* === Route 1 : Chat simple === */
app.post('/api/chat', async (req, res) => {
  console.log("✅ Route POST /api/chat appelée");

  const userMessage = req.body.message;
  const currentPage = req.body.page || '';

  let pageContext = '';
  if (currentPage.includes('choix-lm')) {
    pageContext = "Tu es actuellement sur la page pour rédiger ou modifier une lettre de motivation. Soit l'utilisateur profite de notre IA pour la générer automatiquement, soit il peut importer une lettre existante pour la modifier avec l'IA.";
  } else if (currentPage.includes('choix-cv')) {
    pageContext = "Tu es actuellement sur la page pour créer ou modifier un CV.";
  } else if (currentPage.includes('MesCandidature')) {
    pageContext = "Tu es sur la page qui permet de voir les candidatures en cours.";
  } else if (currentPage.includes('MonParcours')) {
    pageContext = "Tu es sur la page principale du parcours d'accompagnement. Tu retrouves les différentes étapes que l'on propose.";
  }
  else if (currentPage.includes('lettre_motivation')) {
    pageContext = "Tu es sur la page qui permet de générer automatiquement une lettre de motivation grâce à l'IA.";
  }
  else if (currentPage.includes('Partenaires')) {
    pageContext = "Tu es sur la page de nos partenaires. Tu peux retrouver nos principaux partenaires à savoir la Croix Rouge, l'AFPA, mission locale et France TRavail. On donne l'occasion à l'utilisateur de prendre des rendez vous depuis notre plateforme.";
  }
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: `
          Tu es le chatbot officiel d'EmploiAvenir, une plateforme qui utilise l'intelligence artificielle pour accompagner les personnes vulnérables dans leur insertion professionnelle. Ton rôle est de guider l'utilisateur pas à pas, dans un langage simple, bienveillant et accessible, même si la personne est perdue ou n'a aucune expérience.

Commence toujours tes réponses par : [Assistant EMPLOI AVENIR]

Tu peux proposer :
- Des conseils pour démarrer une recherche d'emploi
- Des redirections vers des pages du site quand c'est utile
- Du soutien et des questions simples pour aider la personne à avancer

Sois clair et jamais impersonnel. Si quelqu’un dit qu’il n’a rien (ni CV, ni LM), tu dois **immédiatement l’orienter** vers :
👉 "MonParcours.html" : pour l’accompagnement complet
👉 "choix-cv.html" : pour générer ou modifier un CV
👉 "choix-lm.html" : pour rédiger une lettre de motivation

Exemples de redirections utiles :
- Documents : "Documents.html"
- Parcours emploi : "MonParcours.html"
- Candidatures en cours : "MesCandidature.html"
- Préparer un entretien : "preparation-entretien.html"
- Suite d’entretien : "apres-entretien.html"
- Signature ou contrat : "Contrat.html"

Si une réponse courte peut suffire, propose un lien **et explique brièvement ce que l’utilisateur y trouvera**. Si la question est hors sujet (politique, sport, etc.), indique gentiment que tu es spécialisé en emploi.

**Important :** Si l’utilisateur t’écrit "je suis perdu", "je n'ai rien", "je ne sais pas quoi faire", **n'attends pas**, propose directement un accompagnement et une première action concrète.

Sois toujours rassurant, encourageant et structuré.

Si la personne te demande pourquoi l'IA, quelles sont les utilités de l'intelligence artificielle etc, tu peux mentionner le fait que l'on propose des générations de lettre de motivation automatiques grâce à l'IA, que l'on peut modifier des documents grâce à l'IA, et que toi, le chatbot, tu es basée sur de l'IA.

Si jamais quelqu'un te demande c'est quoi les étapes du parcours pour s'insérer professionnellement. Tu le renvoies vers la page "MonParcours.html" et tu lui dis que les étapes sur notre plateforme sont : 
1- Quiz
2- CV
3- Lettre de motivation 
4- Recherche d'offres
5- Entretien et après entretien 
6- Contrat 
7- Félicitations !
${pageContext}

          ` },
        { role: 'user', content: userMessage }
      ],
    });

    const botReply = completion.choices[0].message.content;
    res.json({ reply: botReply });
  } catch (error) {
  console.error('❌ Erreur OpenAI (chat):', error.message);
  console.error(error.stack);
  res.status(500).json({ reply: 'Une erreur est survenue. Merci de réessayer plus tard.' });
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

/* Amélioration LM */
app.post("/api/ameliore-lettre", async (req, res) => {
  try {
    const texte = req.body.texte;

    if (!texte || texte.trim().length < 100) {
      return res.status(400).json({ error: "Le texte de la lettre est trop court ou vide." });
    }

    // Prompt de demande à OpenAI (GPT-4)
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Ou gpt-3.5-turbo si tu veux réduire les coûts
      messages: [
        {
          role: "system",
          content: "Tu es un assistant RH expert en rédaction de lettres de motivation."
        },
        {
          role: "user",
          content: `Voici une lettre de motivation écrite par une personne en recherche d'emploi. Ta mission est de l'améliorer : style, grammaire, impact, clarté. Garde le fond mais améliore la forme. Voici le texte original :\n\n${texte}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const reponse = completion.choices[0].message.content;

    res.json({ ameliore: reponse });

  } catch (error) {
    console.error("Erreur lors de l'appel à OpenAI :", error.message);
    res.status(500).json({ error: "Une erreur est survenue lors de l'amélioration de la lettre." });
  }
});

const { Document, Packer, Paragraph, TextRun } = require("docx");
const fs = require("fs");
const path = require("path");

app.post("/api/export-word", async (req, res) => {
  try {
    const { texte } = req.body;

    if (!texte) {
      return res.status(400).json({ error: "Texte manquant" });
    }

    // Création du document Word avec chaque paragraphe
    const doc = new Document({
      sections: [
        {
          children: texte.split('\n').map(line =>
            new Paragraph({
              children: [new TextRun(line)],
              spacing: { after: 200 }
            })
          )
        }
      ]
    });

    // Création du buffer Word
    const buffer = await Packer.toBuffer(doc);

    // Envoie du fichier au client
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", "attachment; filename=lettre_ameliorée.docx");
    res.send(buffer);

  } catch (error) {
    console.error("Erreur export Word :", error);
    res.status(500).json({ error: "Erreur lors de la génération du document Word." });
  }
});



// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur backend démarré sur http://localhost:${PORT}`);
});
