// parcoursConfig.js
const SHARED_PROGRESS_KEY = 'emploiAvenirUserProgress';

const ETAPES_PARCOURS = [
    {
        id: 0,
        nomKey: "stepEvaluation", // Clé pour i18n
        nomDefault: "Évaluation Express",
        descriptionKey: "etape0Texte",
        descriptionDefault: "Commencez ici pour évaluer votre situation.",
        page: "questionnaire.html",
        iconClass: "fas fa-clipboard-question",
        completed: false // Sera mis à jour via localStorage
    },
    {
        id: 1,
        nomKey: "stepCvLm",
        nomDefault: "Mon CV & LM",
        descriptionKey: "etape1Texte",
        descriptionDefault: "Créez ou améliorez votre CV et lettre de motivation.",
        page: "choix-cv.html",
        iconClass: "fas fa-file-alt",
        completed: false
    },
    {
        id: 2,
        nomKey: "stepRecherche",
        nomDefault: "Recherche & Candidature",
        descriptionKey: "etape2Texte",
        descriptionDefault: "Trouvez des offres et postulez.",
        page: "recherche-candidature.html",
        iconClass: "fas fa-search",
        completed: false
    },
    {
        id: 3,
        nomKey: "stepEntretien",
        nomDefault: "Préparation Entretien",
        descriptionKey: "etape3Texte",
        descriptionDefault: "Préparez vos entretiens.",
        page: "preparation-entretien.html",
        iconClass: "fas fa-chalkboard-user",
        completed: false
    },
    {
        id: 4,
        nomKey: "stepApresEntretien",
        nomDefault: "L'Après Entretien",
        descriptionKey: "etape4Texte",
        descriptionDefault: "Analysez et gardez la motivation.",
        page: "apres-entretien.html",
        iconClass: "fas fa-comments",
        completed: false
    },
    {
        id: 5,
        nomKey: "stepContrat",
        nomDefault: "Le Contrat",
        descriptionKey: "etape5Texte",
        descriptionDefault: "Comprenez et signez votre contrat.",
        page: "Contrat.html",
        iconClass: "fas fa-file-signature",
        completed: false
    },
    {
        id: 6,
        nomKey: "stepSuivi",
        nomDefault: "Le Suivi",
        descriptionKey: "etape6Texte",
        descriptionDefault: "Bénéficiez d'un accompagnement.",
        page: "Suivi.html",
        iconClass: "fas fa-handshake",
        completed: false
    },
    {
        id: 7,
        nomKey: "stepFelicitations",
        nomDefault: "Objectif atteint !",
        descriptionKey: "etape7Texte",
        descriptionDefault: "Vous avez réussi. Bravo !",
        page: "felicitation.html",
        iconClass: "fas fa-champagne-glasses",
        completed: false
    }
];

// Fonction pour récupérer les traductions si i18next ou similaire est utilisé
// Pour cet exemple, nous utiliserons nomDefault et descriptionDefault
// Vous devrez adapter cette partie si vous utilisez une librairie i18n de manière globale
function getEtapeText(etape, fieldKey, fieldDefault) {
    if (window.i18n && window.i18n.exists(etape[fieldKey])) {
        return window.i18n.t(etape[fieldKey]);
    }
    return etape[fieldDefault];
}