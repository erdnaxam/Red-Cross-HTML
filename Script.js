/*
 * script.js pour le site EmploiAvenir
 * Centralise toutes les fonctionnalités JavaScript
 * Gère les éléments communs (header, nav, modals, chatbot)
 * et initialise les logiques spécifiques à chaque page si les éléments sont présents
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- Utilitaires Communs ---

    // Fonction utilitaire pour assainir le HTML (prévention XSS)
    function escapeHTML(str) {
        if (typeof str !== 'string' && typeof str !== 'number') return str; // Retourne l'original si ce n'est pas une chaîne ou un nombre
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // Fonction pour afficher les notifications (Toast)
    function showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) { console.error('Toast container not found'); return; }

        const toast = document.createElement('div');
        // Utilise les classes toast-* que vous avez définies dans style.css
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        toastContainer.appendChild(toast);

        // Gérer l'affichage avec un délai et la classe show (si transition CSS)
        setTimeout(() => {
            toast.classList.add('show');
            // Masquer et supprimer le toast après un délai
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300); // Attendre la fin de l'animation de disparition
            }, 3000); // Affiché pendant 3 secondes
        }, 10); // Petit délai pour permettre au DOM de se mettre à jour avant la transition
    }


    // --- Scripts Communs à Toutes les Pages ---

    // Header scroll effect
    const header = document.getElementById('header');
    if (header) { // Vérifie si l'élément existe sur la page
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }


    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainNavLinks = document.getElementById('mainNavLinks');
    if (mobileMenuBtn && mainNavLinks) { // Vérifie si les éléments existent
        mobileMenuBtn.addEventListener('click', function() {
            const isExpanded = mainNavLinks.classList.toggle('show-mobile'); // Utilise la classe définie pour mobile
            mobileMenuBtn.setAttribute('aria-expanded', isExpanded.toString());
            mobileMenuBtn.setAttribute('aria-label', isExpanded ? 'Fermer le menu de navigation' : 'Ouvrir le menu de navigation');
        });

        // Fermer le menu si on clique sur un lien (sur mobile)
        mainNavLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                // S'assure que le menu est visible et que le bouton existe
                if (mainNavLinks.classList.contains('show-mobile') && mobileMenuBtn) {
                    mainNavLinks.classList.remove('show-mobile');
                    mobileMenuBtn.setAttribute('aria-expanded', 'false');
                    mobileMenuBtn.setAttribute('aria-label', 'Ouvrir le menu de navigation');
                }
            });
        });
    }


    // Login Modal functionality
    const loginModal = document.getElementById('loginModal');
    // Le bouton qui ouvre la modale n'est pas dans toutes les pages HTML fournies,
    // mais le script le cherchait par ID 'loginBtn'. On garde ce sélecteur.
    // Si votre bouton d'ouverture a un autre ID (ex: 'loginBtnHeader' sur index.html),
    // il faut le sélectionner ici.
    const loginBtn = document.getElementById('loginBtn'); // Assurez-vous qu'un élément cliquable a cet ID
    const closeModalBtn = loginModal ? loginModal.querySelector('.close-modal') : null;
    const loginForm = loginModal ? document.getElementById('loginForm') : null;

    if (loginModal) { // N'active la logique modale que si la modale HTML existe
        if (loginBtn) { // N'ajoute l'écouteur que si le bouton d'ouverture existe
            loginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                loginModal.style.display = 'block'; // Rendre visible avant d'ajouter la classe
                setTimeout(() => loginModal.classList.add('show'), 10); // Ajouter la classe pour la transition
                // Mettre le focus sur le premier champ pour l'accessibilité
                loginModal.querySelector('input[type="email"], input[type="text"], input[type="password"]') ?.focus();
            });
        }

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', function() {
                loginModal.classList.remove('show');
                // Cacher complètement après la fin de la transition
                setTimeout(() => loginModal.style.display = 'none', 300);
            });
        }

        // Fermer la modale en cliquant en dehors
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                loginModal.classList.remove('show');
                setTimeout(() => loginModal.style.display = 'none', 300);
            }
        });

        // Fermer la modale avec la touche Échap
        window.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && loginModal.classList.contains('show')) {
                loginModal.classList.remove('show');
                setTimeout(() => loginModal.style.display = 'none', 300);
            }
        });

        // Simulation de soumission du formulaire de connexion
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                // Ici, vous intégreriez la vraie logique de connexion
                alert('Connexion simulée réussie !');
                loginModal.classList.remove('show');
                setTimeout(() => loginModal.style.display = 'none', 300);
                // Redirection ou mise à jour de l'interface utilisateur après connexion réussie
            });
        }
    }


    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const hrefAttribute = this.getAttribute('href');
            // Vérifie si le lien est une ancre et n'est pas juste "#"
            if (hrefAttribute && hrefAttribute.startsWith('#') && hrefAttribute.length > 1) {
                const targetElement = document.querySelector(hrefAttribute);
                if (targetElement) {
                    e.preventDefault(); // Empêche le comportement par défaut du lien

                    // Calcule la position de défilement en tenant compte du header fixe
                    const headerOffset = header ? header.offsetHeight : 80; // Hauteur du header ou valeur par défaut
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth' // Défilement animé
                    });

                    // Optionnel: Fermer le menu mobile si on a cliqué sur un lien de navigation
                    if (mainNavLinks && mainNavLinks.classList.contains('show-mobile') && this.closest('.nav-links')) {
                        mainNavLinks.classList.remove('show-mobile');
                        if (mobileMenuBtn) {
                            mobileMenuBtn.setAttribute('aria-expanded', 'false');
                            mobileMenuBtn.setAttribute('aria-label', 'Ouvrir le menu de navigation');
                        }
                    }
                } else if (hrefAttribute === '#') {
                     e.preventDefault(); // Empêche le saut pour les liens vides href="#"
                }
            }
        });
    });


    // Animation on scroll (using Intersection Observer)
    const animateElements = document.querySelectorAll('.animate-fade-in, .animate-slide-in-right');
    // Configuration de l'observateur
    const intersectionObserverOptions = {
        root: null, // root: null signifie utiliser le viewport comme conteneur de référence
        rootMargin: '0px', // Marge autour du root (viewport)
        threshold: 0.1 // Un élément est considéré comme visible si 10% de sa surface est dans le viewport
    };

    // Crée l'instance de l'observateur
    const animObserver = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Si l'élément devient visible
                // Applique les styles finaux pour déclencher l'animation (basé sur le CSS initial qui animait direct)
                // OU si votre CSS utilise une classe comme .is-visible pour déclencher, ajoutez cette classe ici :
                // entry.target.classList.add('is-visible');

                // Dans le cas de votre CSS actuel qui anime directement, on met à jour les styles initiaux
                 entry.target.style.opacity = '1';
                 if (entry.target.classList.contains('animate-fade-in')) {
                    entry.target.style.transform = 'translateY(0)';
                 } else if (entry.target.classList.contains('animate-slide-in-right')) {
                    entry.target.style.transform = 'translateX(0)';
                 }

                // Optionnel: Cesser d'observer l'élément si l'animation ne doit se jouer qu'une fois
                // observerInstance.unobserve(entry.target);
            } else {
                 // Optionnel: Réinitialiser l'état si vous voulez que l'animation se rejoue quand l'élément redevient visible
                 // C'est souvent non souhaité pour les animations d'apparition au scroll, mais dépend du design.
                 // entry.target.style.opacity = '0';
                 // if (entry.target.classList.contains('animate-fade-in')) {
                 //    entry.target.style.transform = 'translateY(10px)';
                 // } else if (entry.target.classList.contains('animate-slide-in-right')) {
                 //    entry.target.style.transform = 'translateX(50px)';
                 // }
            }
        });
    }, intersectionObserverOptions);

    // Initialise les éléments avant de commencer l'observation et lance l'observation
    animateElements.forEach(el => {
        if (el) { // S'assure que l'élément existe
            // Définit l'état initial pour les éléments qui seront animés
            // Ces styles doivent correspondre à l'état "from" de vos keyframes CSS ou à l'état par défaut dans votre CSS
             el.style.opacity = '0';
             if (el.classList.contains('animate-fade-in')) {
                 el.style.transform = 'translateY(10px)';
             } else if (el.classList.contains('animate-slide-in-right')) {
                 el.style.transform = 'translateX(50px)';
             }
            // Commencez à observer l'élément
            animObserver.observe(el);
        }
    });


    // Chatbot functionality
    const chatbotBtn = document.getElementById('chatbotBtn');
    const chatbotContainer = document.getElementById('chatbotContainer');
    const closeChatbotBtn = document.getElementById('closeChatbot');
    const chatbotMessagesEl = document.getElementById('chatbotMessages');
    const chatbotInputEl = document.getElementById('chatbotInput');
    const sendMessageBtn = document.getElementById('sendMessage');

    if (chatbotBtn && chatbotContainer && closeChatbotBtn && chatbotMessagesEl && chatbotInputEl && sendMessageBtn) { // Vérifie si tous les éléments existent
        // Gestion de l'ouverture/fermeture du chatbot
        chatbotBtn.addEventListener('click', function() {
            const isChatOpen = chatbotContainer.classList.toggle('show'); // Toggle la classe pour la transition
            chatbotBtn.setAttribute('aria-expanded', isChatOpen.toString());

            if (isChatOpen) {
                chatbotContainer.style.display = 'flex'; // Affiche le conteneur (utilisé avec la classe 'show' pour la transition)
                // Donne un petit délai pour que le display:flex soit appliqué avant la transition d'opacité/transform
                setTimeout(() => {
                     chatbotContainer.style.opacity = '1';
                     chatbotContainer.style.transform = 'translateY(0)';
                }, 10);
                chatbotInputEl.focus(); // Met le focus sur l'input
            } else {
                 // Lance la transition de fermeture
                 chatbotContainer.style.opacity = '0';
                 chatbotContainer.style.transform = 'translateY(20px)';
                // Cache complètement après la fin de la transition
                setTimeout(() => chatbotContainer.style.display = 'none', 300);
            }
        });

        // Fermeture via le bouton "X"
        closeChatbotBtn.addEventListener('click', function() {
            chatbotContainer.classList.remove('show'); // Retire la classe de transition
            chatbotBtn.setAttribute('aria-expanded', 'false');
            // Lance la transition de fermeture
            chatbotContainer.style.opacity = '0';
            chatbotContainer.style.transform = 'translateY(20px)';
            // Cache complètement après la fin de la transition
            setTimeout(() => chatbotContainer.style.display = 'none', 300);
        });

        // Ajoute un message à la fenêtre de chat
        function addMessageToChat(message, isUser = false) {
            const messageDiv = document.createElement('div');
            // Utilise les classes CSS pour le style (bot-message ou user-message)
            messageDiv.className = isUser ? 'message user-message' : 'message bot-message';
            messageDiv.textContent = message;
            chatbotMessagesEl.appendChild(messageDiv);
            // Fait défiler pour voir le dernier message
            chatbotMessagesEl.scrollTop = chatbotMessagesEl.scrollHeight;
        }

        // Gère l'envoi d'un message utilisateur
        function sendChatMessage() {
            const messageText = chatbotInputEl.value.trim();
            if (messageText) {
                addMessageToChat(messageText, true); // Ajoute le message utilisateur
                chatbotInputEl.value = ''; // Vide l'input

                // Simulation de réponse du bot
                setTimeout(() => {
                    const responses = [
                        "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
                        "Je comprends. Vous pouvez trouver des ressources sur la page 'Nos partenaires'.",
                        "Pour créer ou améliorer votre CV, consultez l'Étape 1 de 'Mon Parcours'.",
                        "Vous avez une question spécifique ? Un conseiller peut vous rappeler, contactez-nous via la page 'Contact'."
                    ];
                    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                    addMessageToChat(randomResponse); // Ajoute la réponse du bot
                }, 500); // Délai pour simuler une "réponse"
            }
        }

        // Écouteur pour le clic sur le bouton Envoyer
        sendMessageBtn.addEventListener('click', sendChatMessage);

        // Écouteur pour la touche Entrée dans l'input
        chatbotInputEl.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });

        // Message initial du bot (si nécessaire)
        // addMessageToChat("Bonjour ! Comment puis-je vous aider aujourd'hui ?"); // déjà dans le HTML
    }


    // --- Scripts Spécifiques par Page (Initialisés si les éléments existent) ---

    // Logique de la page Mon Parcours
    function initParcoursPage() {
        // Vérifie si c'est la page Mon Parcours en cherchant un élément clé
        const progressionBarEl = document.querySelector('.parcours-progress-bar');
        if (!progressionBarEl) return; // Quitte la fonction si les éléments ne sont pas présents

        // --- Références DOM spécifiques à Mon Parcours ---
        const etapesValideesSpan = document.getElementById('etapes-validees');
        const progressionPourcentageSpan = document.getElementById('progression-pourcentage');
        const progressBar = document.getElementById('progression-bar');
        const derniereActiviteSpan = document.getElementById('derniere-activite');
        const badgesContainer = document.getElementById('badges-gagnes');
        const progressSteps = document.querySelectorAll('.parcours-progress-bar .progress-step');
        const detailCards = document.querySelectorAll('.etapes-grid .etape-carte');
        const progressLineActive = document.querySelector('.parcours-progress-bar .progress-line-active');

        // --- Données spécifiques à Mon Parcours ---
        const totalEtapes = 8; // De 0 à 7 inclus
        // L'état de progression DOIT être chargé depuis un stockage (local ou serveur)
        // Pour la démo, on charge depuis localStorage
        let etapesCompletes = parseInt(localStorage.getItem('emploiavenir_parcours_etapesCompletes') || '0', 10);
         // Assure que le nombre d'étapes complétées est valide
        if (etapesCompletes < 0 || etapesCompletes > totalEtapes) {
            etapesCompletes = 0;
        }


        // --- Mappage des badges ---
        const badges = [ // Définir les badges et quand ils sont gagnés (basé sur les étapes complétées)
           { id: 'medal', icon: 'fa-medal', earnedStep: 1, title: 'Premier Pas !', description: 'Terminez votre première étape (Évaluation).' }, // Gagné après l'étape 0
           { id: 'star', icon: 'fa-star', earnedStep: 4, title: 'Mi-Parcours !', description: 'Atteignez la moitié du parcours.' }, // Gagné après l'étape 3
           { id: 'trophy', icon: 'fa-trophy', earnedStep: 8, title: 'Objectif Atteint !', description: 'Terminez le parcours.' } // Gagné après l'étape 7
        ];

        // --- Icônes spécifiques par étape (pour l'état actif/initial) ---
         const etapeIcons = [
            'fa-clipboard-question', // Etape 0
            'fa-file-alt',         // Etape 1 (CV & LM)
            'fa-search',           // Etape 2 (Recherche & Candidature)
            'fa-chalkboard-user',  // Etape 3 (Préparation Entretien)
            'fa-comments',         // Etape 4 (Après Entretien)
            'fa-file-signature',   // Etape 5 (Contrat)
            'fa-handshake',        // Etape 6 (Suivi Intégration)
            'fa-champagne-glasses' // Etape 7 (Félicitations/Fin)
        ];


        // --- Fonctions de Rendu/Mise à jour ---

        function updateProgressionUI() {
            // Mise à jour du dashboard texte
            etapesValideesSpan.textContent = `${etapesCompletes}/${totalEtapes}`;
            const pourcentage = Math.round((etapesCompletes / totalEtapes) * 100);
            progressionPourcentageSpan.textContent = `${pourcentage}%`;
            progressBar.value = pourcentage; // Met à jour la barre <progress> HTML5

             // Mise à jour de la dernière activité (à lier à la date réelle de complétion si stockée)
            const lastActivityDate = localStorage.getItem('emploiavenir_parcours_lastActivityDate');
             if (lastActivityDate) {
                derniereActiviteSpan.textContent = new Date(lastActivityDate).toLocaleDateString('fr-FR');
             } else {
                derniereActiviteSpan.textContent = "Jamais";
             }


            // Mise à jour visuelle des bulles de progression
            progressSteps.forEach((step, index) => {
                step.classList.remove('is-active', 'is-completed');
                // L'index 0 correspond à l'étape 0, index 1 à l'étape 1, etc.
                // Si l'utilisateur a complété X étapes, les étapes d'index 0 à X-1 sont complétées.
                if (index < etapesCompletes) {
                    step.classList.add('is-completed');
                } else if (index === etapesCompletes) {
                    step.classList.add('is-active');
                }
            });

            // Mise à jour de la ligne de progression visuelle (entre les bulles)
            // La ligne va jusqu'au centre de la bulle de l'étape complétée (ou la dernière bulle complétée).
            // totalEtapes - 1 est le nombre de segments entre les bulles.
            // Si etapesCompletes = 0, width = 0.
            // Si etapesCompletes = 1 (étape 0 finie), width = (1-1) / (8-1) * 100 = 0%. (la ligne commence *après* la bulle 0) -> Ajustement : la ligne devrait aller jusqu'à la fin de la bulle complétée ou le début de l'active.
            // On peut simplifier pour la démo : la ligne va jusqu'au début de l'étape active.
            // Si etapesCompletes = 0 (Active = 0), ligne à 0.
            // Si etapesCompletes = 1 (Active = 1), ligne va jusqu'au début de l'étape 1.
            // La position de chaque étape (hors padding/marge externe) peut être calculée.
            // Pour une barre simplifiée, on peut utiliser le pourcentage de complétion des *segments*.
            // Il y a `totalEtapes - 1` segments. Si 0 étapes complétées, 0 segments finis. Si 1 complétée (étape 0), 1 segment fini.
            const completedSegments = etapesCompletes > 0 ? etapesCompletes : 0; // Si étape 0 est finie (etapesCompletes=1), 1 segment est "visuellement" fini avant l'étape 1
             const totalSegments = totalEtapes - 1; // 7 segments pour 8 étapes
             const progressLinePercentage = totalSegments > 0 ? (completedSegments / totalSegments) * 100 : 0;

             // Ajustement visuel : si étape 0 est complétée (etapesCompletes = 1), la ligne devrait aller jusqu'au MILIEU de la bulle 1 pour symboliser le "lien".
             // Il faut affiner le calcul si la barre va au centre de la *prochaine* étape active/complétée.
             // Pour une démo simple, utilisons un calcul basé sur les étapes complétées divisé par le total - 1 segment
             // 0/7, 1/7, 2/7, ..., 7/7 (100%).
              const lineProgressValue = totalEtapes > 1 ? (etapesCompletes / (totalEtapes - 1)) * 100 : 0;
              progressLineActive.style.width = `${lineProgressValue}%`;


            // Mise à jour visuelle et fonctionnelle des cartes étapes
            detailCards.forEach((card, index) => {
                card.classList.remove('is-active', 'is-locked', 'is-completed'); // Reset classes
                const iconElement = card.querySelector('.etape-icon i');
                const actionLink = card.querySelector('.etape-action');

                // Mettre à jour les icônes spécifiques des étapes
                 if(iconElement && etapeIcons[index]) { // Utilise l'icône par défaut/active
                     iconElement.className = `fas ${etapeIcons[index]}`;
                 }


                // Logic d'état (Complétée, Active, Bloquée)
                if (index < etapesCompletes) {
                    // Étape Complétée
                    card.classList.add('is-completed');
                    if(iconElement) iconElement.className = 'fas fa-check-circle'; // Icône validée pour complété
                    if (actionLink) {
                        actionLink.style.display = 'none'; // Cache le bouton d'action
                         actionLink.setAttribute('aria-hidden', 'true');
                    }


                } else if (index === etapesCompletes) {
                    // Étape Active
                    card.classList.add('is-active');
                    // L'icône par défaut est déjà mise plus haut
                    if (actionLink) {
                        actionLink.style.display = 'inline-flex'; // Assure qu'il est affiché (selon le CSS)
                        actionLink.removeAttribute('aria-hidden');
                        // Le href est défini dans le HTML et la navigation est gérée par le navigateur
                        // Le script n'a rien à ajouter ici pour la navigation
                    }


                } else {
                    // Étape Bloquée
                    card.classList.add('is-locked');
                    if(iconElement) iconElement.className = 'fas fa-lock'; // Icône verrou pour bloqué
                    if (actionLink) {
                        actionLink.style.display = 'none'; // Cache le bouton d'action
                         actionLink.setAttribute('aria-hidden', 'true');
                    }
                }
            });

            // Mise à jour des badges
            updateBadgesUI();
        }

        // Met à jour l'affichage des badges
        function updateBadgesUI() {
            if (!badgesContainer) return;
            badgesContainer.innerHTML = ''; // Vider les badges actuels

            badges.forEach(badge => {
                const badgeIcon = document.createElement('i');
                badgeIcon.className = `fas ${badge.icon}`; // Classe Font Awesome

                if (etapesCompletes >= badge.earnedStep) {
                    // Badge gagné
                    badgeIcon.classList.add('earned'); // Classe pour couleur "gagné"
                    badgeIcon.setAttribute('aria-label', `Badge obtenu : ${badge.title} - ${badge.description}`);
                    badgeIcon.setAttribute('title', `Badge obtenu : ${badge.title}`); // Infobulle
                    badgeIcon.removeAttribute('aria-hidden'); // Visuellement présent et sémantique
                } else {
                     // Badge non gagné
                     // Optionnel: ajouter une classe pour les badges non gagnés s'ils ont un style spécifique
                     // badgeIcon.classList.add('not-earned');
                     badgeIcon.setAttribute('aria-label', `Badge : ${badge.title} (non obtenu) - ${badge.description}`);
                     badgeIcon.setAttribute('title', `Badge : ${badge.title} (non obtenu)`);
                     badgeIcon.removeAttribute('aria-hidden'); // Les non-gagnés peuvent aussi être visibles mais grisés par CSS
                }
                badgesContainer.appendChild(badgeIcon);
            });
        }


        // Fonction pour "compléter" une étape (appelée depuis les pages d'étape, pas depuis MonParcours.html)
        // Cette fonction est à appeler par le script de la page *suivante* une fois qu'une étape est terminée.
        window.completeCurrentParcoursStep = function() {
             // Vérifie si l'étape actuelle n'est pas déjà la dernière et n'est pas déjà complétée
             if (etapesCompletes < totalEtapes) {
                 etapesCompletes++; // Incrémente l'étape complétée
                 localStorage.setItem('emploiavenir_parcours_etapesCompletes', etapesCompletes.toString()); // Sauvegarde la progression
                 localStorage.setItem('emploiavenir_parcours_lastActivityDate', new Date().toISOString().split('T')[0]); // Sauvegarde la date

                 // Optionnel: Afficher un message de succès ou rediriger
                 console.log(`Progression sauvegardée. Vous êtes maintenant à l'étape ${etapesCompletes + 1}.`);
                 // Redirection automatique vers la page MonParcours ou la page de la prochaine étape
                 // window.location.href = 'MonParcours.html'; // Exemple
             } else {
                 console.log("Le parcours est déjà complété.");
             }
        };


        // --- Initialisation de la page Mon Parcours ---
        updateProgressionUI(); // Met à jour l'interface au chargement


        // Écouteur d'événements pour le bouton Aide (s'il existe sur cette page)
         const aideButton = document.querySelector('.aide-button');
         if (aideButton) {
             aideButton.addEventListener('click', () => {
                 // Déclencher le Chatbot ou afficher une modale d'aide contextuelle
                 alert('Fonctionnalité d\'aide à implémenter : ouvrir le chatbot ou une modale d\'aide contextuelle.');
                 // Exemple d'ouverture du chatbot si l'élément existe et que la fonction du chatbot est accessible
                 // if(chatbotBtn) chatbotBtn.click();
             });
         }


         // Les liens .etape-action sur cette page naviguent simplement vers les pages des étapes.
         // La logique de complétion doit être sur les pages de destination elles-mêmes.


    } // Fin de initParcoursPage


    // Logique de la page Mes Documents
    function initDocumentsPage() {
        // Vérifie si c'est la page Mes Documents
        const documentListContainer = document.getElementById('documentList');
        if (!documentListContainer) return; // Quitte si les éléments ne sont pas présents

        // --- Données spécifiques à Mes Documents ---
        // Ces données devraient idéalement venir d'une API ou du stockage local
         let documentsData = JSON.parse(localStorage.getItem('emploiavenir_documents')) || [
             {
                 id: "doc1",
                 title: "Mon CV",
                 type: "Curriculum Vitae",
                 date: "12/04/2025", // Format AAAA-MM-JJ recommandé si on veut trier facilement
                 status: "completed",
                 url: "#" // Lien de téléchargement/visualisation réel
             },
             {
                 id: "doc2",
                 title: "Lettre de motivation (Modèle)",
                 type: "Lettre de motivation",
                 date: "14/04/2025",
                 status: "draft",
                 url: "#"
             },
             {
                 id: "doc3",
                 title: "Attestation de formation",
                 type: "Document officiel",
                 date: "10/04/2025",
                 status: "completed",
                 url: "#"
             }
             // Ajoute d'autres documents ici si nécessaire
         ];

        // --- Références DOM spécifiques à Mes Documents ---
        const noDocumentsMessage = document.getElementById('no-documents-message');
        const createDocBtn = document.getElementById('createDocumentButton'); // ID corrigé
        const helpDocBtn = document.getElementById('helpDocumentsButton'); // ID corrigé
        const downloadAllBtn = document.getElementById('downloadAllButton'); // ID corrigé


        // --- Fonctions de Rendu/Mise à jour ---

        function renderDocuments() {
            if (!documentListContainer || !noDocumentsMessage) return;

            documentListContainer.innerHTML = ''; // Vide la liste actuelle

            if (!documentsData || documentsData.length === 0) {
                noDocumentsMessage.style.display = 'block'; // Affiche le message si pas de documents
                 documentListContainer.style.display = 'none';
                 // Optionnel : cacher le bouton "Télécharger tout" si pas de documents
                 if(downloadAllBtn) downloadAllBtn.style.display = 'none';
                return;
            } else {
                 noDocumentsMessage.style.display = 'none'; // Cache le message s'il y a des documents
                 documentListContainer.style.display = 'flex'; // ou 'block' selon le CSS
                 if(downloadAllBtn) downloadAllBtn.style.display = 'inline-flex'; // Afficher le bouton
            }

            documentsData.forEach(doc => {
                // Utilise l'objet Date pour formatter la date si elle est au bon format
                const displayDate = doc.date ? new Date(doc.date).toLocaleDateString('fr-FR') : 'Date inconnue';
                const docElement = document.createElement('div');
                docElement.className = 'document-item';
                docElement.dataset.documentId = escapeHTML(doc.id); // Ajoute l'ID

                docElement.innerHTML = `
                    <div class="info">
                        <strong class="title">${escapeHTML(doc.title)}</strong>
                        <p class="meta">
                            <span>${escapeHTML(doc.type)}</span>
                            <span>Date: ${escapeHTML(displayDate)}</span>
                        </p>
                    </div>
                    <div class="actions">
                        <!-- Utilisation des classes de boutons et icônes Font Awesome -->
                         <a href="${escapeHTML(doc.url)}" class="button button-outline button-icon button-small" aria-label="Voir ou télécharger le document ${escapeHTML(doc.title)}" title="Voir ou télécharger" target="_blank" rel="noopener noreferrer">
                            <i class="fas fa-eye" aria-hidden="true"></i>
                         </a>
                         <!-- Bouton Modifier -->
                          <button type="button" class="button button-secondary button-icon button-small edit-document-btn" data-document-id="${escapeHTML(doc.id)}" aria-label="Modifier le document ${escapeHTML(doc.title)}" title="Modifier">
                             <i class="fas fa-edit" aria-hidden="true"></i>
                          </button>
                         <!-- Bouton Supprimer -->
                         <button type="button" class="button button-destructive button-icon button-small delete-document-btn" data-document-id="${escapeHTML(doc.id)}" aria-label="Supprimer le document ${escapeHTML(doc.title)}" title="Supprimer">
                            <i class="fas fa-trash-alt" aria-hidden="true"></i>
                         </button>
                        <!-- Badge statut -->
                        <span class="badge status-badge ${doc.status === 'completed' ? 'completed' : 'draft'}">
                             ${doc.status === 'completed' ? 'Complet' : 'Brouillon'}
                        </span>
                    </div>
                `;
                documentListContainer.appendChild(docElement);
            });

             // Ajouter les écouteurs d'événements aux boutons dynamiques via délégation
             addDocumentEventListeners();
        }

        // Délégation d'événements pour les boutons Voir, Modifier, Supprimer
        function addDocumentEventListeners() {
            if (!documentListContainer) return;

            // On n'attache l'écouteur qu'une seule fois sur le conteneur parent
            documentListContainer.addEventListener('click', function(event) {
                const targetButton = event.target.closest('.button'); // Trouve le bouton cliqué

                if (targetButton) {
                    const docItem = targetButton.closest('.document-item');
                    const docId = docItem ? docItem.dataset.documentId : null;
                    const doc = docId ? documentsData.find(d => d.id === docId) : null;

                    if (!doc) return; // Sort si on ne trouve pas le document

                     // Gère les différents types de boutons cliqués
                    if (targetButton.classList.contains('edit-document-btn')) {
                        console.log(`Modifier document ${doc.title}`);
                        alert(`Fonctionnalité 'Modifier' pour ${doc.title} à implémenter. Redirection vers l'étape de création/modification CV/LM ?`);
                         // Exemple de redirection vers l'étape 1 du parcours pour modifier CV/LM
                        // window.location.href = 'creation-cv-lm.html?docId=' + docId;
                    } else if (targetButton.classList.contains('delete-document-btn')) {
                         // Confirmation avant suppression
                         if (confirm(`Voulez-vous vraiment supprimer le document "${doc.title}" ? Cette action est irréversible.`)) {
                              deleteDocument(docId); // Appelle la fonction de suppression
                         }
                     }
                     // Le bouton 'Voir' est un lien <a>, il n'a pas besoin d'écouteur JS spécifique pour naviguer.
                }
            });
             // Ajoutez un écouteur pour les liens si nécessaire (ex: pour empêcher le comportement par défaut)
              documentListContainer.addEventListener('click', function(event) {
                  const targetLink = event.target.closest('.button.button-outline'); // Trouve le lien 'Voir'
                  if (targetLink) {
                      // Si vous voulez intercepter le clic, par exemple pour ouvrir dans une modale
                      // event.preventDefault();
                      // OuvrirDocumentDansModale(targetLink.href);
                      console.log(`Visualisation du document ${targetLink.href}`);
                  }
              });
        }

         // Supprime un document et rafraîchit l'affichage
         function deleteDocument(docId) {
             const initialLength = documentsData.length;
             documentsData = documentsData.filter(doc => doc.id !== docId); // Filtre pour retirer le document

             if (documentsData.length < initialLength) {
                 // Seulement si un élément a été effectivement retiré
                 localStorage.setItem('emploiavenir_documents', JSON.stringify(documentsData)); // Sauvegarde dans localStorage
                 renderDocuments(documentsData); // Met à jour l'affichage
                 showToast("Document supprimé.", 'success');
             } else {
                  showToast("Erreur: Le document n'a pas été trouvé.", 'error');
             }
         }


        // --- Initialisation de la page Mes Documents ---
        renderDocuments(documentsData); // Affiche la liste au chargement

        // Ajouter les écouteurs pour les boutons principaux (Créer, Aide, Télécharger tout)
         if (createDocBtn) {
             createDocBtn.addEventListener('click', () => {
                 alert("Fonctionnalité 'Créer un nouveau document' en développement. Redirection vers l'Étape 1 du Parcours (Création CV/LM) ?");
                 // window.location.href = 'creation-cv-lm.html';
             });
         }
         if (helpDocBtn) {
             helpDocBtn.addEventListener('click', () => {
                  alert("Fonctionnalité 'Aide pour mes documents' à implémenter. Afficher une modale ou une section FAQ.");
             });
         }
         if (downloadAllBtn) {
              downloadAllBtn.addEventListener('click', () => {
                   alert("Fonctionnalité 'Télécharger tous mes documents' à implémenter.");
              });
         }


    } // Fin de initDocumentsPage


    // Logique de la page Mes Candidatures
    function initCandidaturesPage() {
        // Vérifie si c'est la page Mes Candidatures
        const applicationsListContainer = document.getElementById('applicationsList');
        if (!applicationsListContainer) return; // Quitte si les éléments ne sont pas présents

        // --- Données spécifiques à Mes Candidatures ---
         // Charger les candidatures depuis le stockage local
         let applicationsData = JSON.parse(localStorage.getItem('emploiavenir_candidatures')) || [];


        // --- Références DOM spécifiques à Mes Candidatures ---
         const applicationDialog = document.getElementById('applicationDialog');
         const dialogTitle = applicationDialog ? applicationDialog.querySelector('.dialog-title') : null;
         const saveButton = applicationDialog ? applicationDialog.getElementById('saveApplication') : null;
         const cancelButton = applicationDialog ? applicationDialog.getElementById('cancelDialog') : null;
         const applicationForm = applicationDialog ? applicationDialog.getElementById('applicationForm') : null;
         const addApplicationButton = document.getElementById('addApplicationButton'); // Bouton ajouter sur la page principale

        // --- Mappage des statuts vers les classes CSS (doit correspondre aux styles dans style.css) ---
        const statusColorClasses = {
             'CV envoyé': 'status-cv-envoye',
             'CV retenu': 'status-cv-retenu',
             'Entretien prévu': 'status-entretien-prevu',
             'Entretien passé': 'status-entretien-passe',
             'Offre reçue': 'status-offre-recue',
             'Offre acceptée': 'status-offre-acceptee',
             'Refus': 'status-refus'
         };

         let dialogMode = 'add'; // 'add' ou 'edit'
         let currentApplicationId = null;


        // --- Fonctions de Rendu/Mise à jour ---

         function renderApplications() {
             if (!applicationsListContainer) return;

             applicationsListContainer.innerHTML = ''; // Vide la liste actuelle

             if (!applicationsData || applicationsData.length === 0) {
                 // Affichage si aucune candidature
                 applicationsListContainer.innerHTML = `
                     <div class="card empty-card">
                         <div class="card-content">
                             <p class="text-muted-foreground text-lg mb-4">
                                 Vous n'avez pas encore de candidatures enregistrées.
                             </p>
                             <button type="button" class="button button-primary" id="addFirstApplicationButton">
                                 <i class="fas fa-plus" aria-hidden="true"></i>
                                 <span>Ajouter ma première candidature</span>
                             </button>
                         </div>
                     </div>
                 `;
                  // Ajouter l'écouteur au bouton "Ajouter ma première candidature" s'il est affiché
                  // On utilise la délégation pour ce bouton car il est recréé
                  // Ou mieux, on ajoute l'écouteur *après* le if/else s'il n'est pas délégué
                  document.getElementById('addFirstApplicationButton')?.addEventListener('click', () => {
                     openDialog('add');
                  });

                 return; // Arrête la fonction ici s'il n'y a pas de candidatures
             }

             // Affichage de chaque candidature si la liste n'est pas vide
             applicationsData.forEach(application => {
                  // Formatte la date pour l'affichage
                  const displayDate = application.date ? new Date(application.date).toLocaleDateString('fr-FR') : 'Date inconnue';
                  const applicationHTML = `
                      <article class="card application-card" data-application-id="${escapeHTML(application.id)}">
                          <div class="card-content"> <!-- Utilise card-content comme flex container -->
                              <div class="application-card-main">
                                  <div class="application-card-header">
                                      <div>
                                          <h3 class="application-card-title">
                                              <i class="fas fa-briefcase" aria-hidden="true"></i>
                                              ${escapeHTML(application.position)}
                                          </h3>
                                          <div class="application-card-company">
                                              <i class="fas fa-building" aria-hidden="true"></i>
                                              <span>${escapeHTML(application.company)}</span>
                                          </div>
                                      </div>
                                      <div class="application-card-meta">
                                          <!-- Utilise le mapping statusColorClasses pour la classe CSS -->
                                          <span class="badge ${statusColorClasses[application.status] || 'badge-default'}">${escapeHTML(application.status)}</span>
                                          <div class="application-card-date">
                                              <i class="fas fa-calendar-alt" aria-hidden="true"></i>
                                              <span>${escapeHTML(displayDate)}</span>
                                          </div>
                                      </div>
                                  </div>

                                  ${application.notes ? `<p class="application-card-notes">${escapeHTML(application.notes)}</p>` : ''}
                                  ${(application.contactName || application.contactEmail || application.contactPhone) ? `
                                       <div class="application-card-contact">
                                         <strong>Contact:</strong>
                                         ${application.contactName ? `<p>Nom: ${escapeHTML(application.contactName)}</p>` : ''}
                                         ${application.contactEmail ? `<p>Email: ${escapeHTML(application.contactEmail)}</p>` : ''}
                                         ${application.contactPhone ? `<p>Téléphone: ${escapeHTML(application.contactPhone)}</p>` : ''}
                                       </div>
                                  `: ''}
                              </div>

                              <!-- Colonne Actions et Statut -->
                              <div class="application-card-actions">
                                   <!-- Select pour mettre à jour le statut -->
                                   <!-- Label pour accessibilité - Cache visuellement, lie au select par ID -->
                                   <label for="status-select-${escapeHTML(application.id)}" class="sr-only">Mettre à jour le statut de la candidature pour ${escapeHTML(application.position)} chez ${escapeHTML(application.company)}</label>
                                   <select id="status-select-${escapeHTML(application.id)}" class="w-full update-status-select" data-application-id="${escapeHTML(application.id)}" aria-label="Statut de la candidature">
                                        <!-- Les options sont générées ou codées en dur, elles doivent correspondre à statusColorClasses -->
                                        <option value="CV envoyé" ${application.status === 'CV envoyé' ? 'selected' : ''}>CV envoyé</option>
                                        <option value="CV retenu" ${application.status === 'CV retenu' ? 'selected' : ''}>CV retenu</option>
                                        <option value="Entretien prévu" ${application.status === 'Entretien prévu' ? 'selected' : ''}>Entretien prévu</option>
                                        <option value="Entretien passé" ${application.status === 'Entretien passé' ? 'selected' : ''}>Entretien passé</option>
                                        <option value="Offre reçue" ${application.status === 'Offre reçue' ? 'selected' : ''}>Offre reçue</option>
                                        <option value="Offre acceptée" ${application.status === 'Offre acceptée' ? 'selected' : ''}>Offre acceptée</option>
                                        <option value="Refus" ${application.status === 'Refus' ? 'selected' : ''}>Refus</option>
                                   </select>
                                    <div class="action-buttons">
                                       <!-- Bouton Modifier -->
                                       <button type="button" class="button button-outline button-icon button-small edit-application-button" data-application-id="${escapeHTML(application.id)}" aria-label="Modifier la candidature pour ${escapeHTML(application.position)} chez ${escapeHTML(application.company)}" title="Modifier">
                                            <i class="fas fa-edit" aria-hidden="true"></i>
                                       </button>
                                       <!-- Bouton Supprimer -->
                                       <button type="button" class="button button-destructive button-icon button-small delete-application-button" data-application-id="${escapeHTML(application.id)}" aria-label="Supprimer la candidature pour ${escapeHTML(application.position)} chez ${escapeHTML(application.company)}" title="Supprimer">
                                           <i class="fas fa-trash" aria-hidden="true"></i>
                                       </button>
                                    </div>
                                </div>
                            </div>
                        </article>
                    `;
                    applicationsListContainer.innerHTML += applicationHTML; // Ajoute la nouvelle candidature à la liste
             });

              // Ajouter des eventListeners aux éléments dynamiques via délégation
             addApplicationEventListeners();
         }

         // Délégation d'événements pour les actions sur les candidatures
         function addApplicationEventListeners() {
             if (!applicationsListContainer) return;

             // On n'attache l'écouteur qu'une seule fois sur le conteneur parent
             applicationsListContainer.addEventListener('click', function(event) {
                 const targetButton = event.target.closest('.button'); // Trouve le bouton cliqué
                 const targetSelect = event.target.closest('.update-status-select'); // Trouve le select cliqué

                 if (targetButton) {
                     const applicationId = targetButton.dataset.applicationId;
                     if (!applicationId) return; // Sort si l'ID n'est pas trouvé

                     if (targetButton.classList.contains('edit-application-button')) {
                         openDialog('edit', applicationId); // Ouvrir dialog en mode édition
                     } else if (targetButton.classList.contains('delete-application-button')) {
                          // Confirmation avant suppression
                          if (confirm("Êtes-vous sûr de vouloir supprimer cette candidature ?")) {
                            deleteApplication(applicationId); // Supprimer la candidature
                          }
                     }
                 } else if (targetSelect) {
                     // Le changement de statut est géré par l'écouteur 'change' attaché directement ci-dessous
                 }
             });

             // Écouteur spécifique pour le changement sur les selects de statut (délégation)
             applicationsListContainer.addEventListener('change', function(event) {
                 const targetSelect = event.target.closest('.update-status-select');
                 if (targetSelect) {
                     const applicationId = targetSelect.dataset.applicationId;
                     const newStatus = targetSelect.value;
                     if (applicationId && newStatus) {
                         updateApplicationStatus(applicationId, newStatus); // Mettre à jour le statut
                     }
                 }
             });
         }


         // Ouvre le dialog (modale) en mode ajout ou modification
         function openDialog(mode, applicationId = null) {
             dialogMode = mode;
             currentApplicationId = applicationId;

             if (!applicationDialog || !dialogTitle || !saveButton || !applicationForm) {
                 console.error("Dialog elements not found!");
                 return;
             }

             if (mode === 'add') {
                 dialogTitle.textContent = 'Ajouter une candidature';
                 saveButton.textContent = 'Ajouter';
                 clearDialogFields();  // Vide les champs pour un nouvel ajout
             } else { // mode === 'edit'
                 dialogTitle.textContent = 'Modifier la candidature';
                 saveButton.textContent = 'Enregistrer';
                 populateDialogFields(applicationId);  // Remplir les champs avec les données existantes
             }

             applicationDialog.style.display = 'flex'; // Rendre visible (utilisé avec la classe 'open' pour transition si style.css le gère)
              setTimeout(() => applicationDialog.classList.add('open'), 10); // Ajouter la classe pour transition
             // Mettre le focus sur le premier champ pour l'accessibilité
             applicationForm.querySelector('input, select')?.focus();
         }

         // Ferme le dialog (modale)
         function closeDialog() {
              if (!applicationDialog) return;
             applicationDialog.classList.remove('open'); // Retire la classe de transition
             // Cacher complètement après la fin de la transition
             setTimeout(() => applicationDialog.style.display = 'none', 300);
         }

         // Vide tous les champs du formulaire du dialog
         function clearDialogFields() {
             if (applicationForm) applicationForm.reset(); // Réinitialise tous les champs du formulaire
             // Définit la date du jour par défaut
             const today = new Date().toISOString().split('T')[0];
             const dateInput = document.getElementById('date'); // Sélectionner le champ date
              if (dateInput) dateInput.value = today;
             // Sélectionne le statut par défaut "CV envoyé"
             const statusSelect = document.getElementById('status'); // Sélectionner le champ statut
              if (statusSelect) statusSelect.value = 'CV envoyé';

         }

         // Remplit les champs du formulaire du dialog avec les données d'une candidature existante
         function populateDialogFields(applicationId) {
             const application = applicationsData.find(app => app.id === applicationId);
             if (application && applicationForm) {
                  // Remplir les champs (utilise optional chaining)
                 document.getElementById('company').value = application.company || '';
                 document.getElementById('position').value = application.position || '';
                 document.getElementById('date').value = application.date || '';
                 document.getElementById('status').value = application.status || 'CV envoyé';
                 document.getElementById('notes').value = application.notes || '';
                 document.getElementById('contactName').value = application.contactName || '';
                 document.getElementById('contactEmail').value = application.contactEmail || '';
                 document.getElementById('contactPhone').value = application.contactPhone || '';
             } else {
                 console.error(`Application with ID ${applicationId} not found for population.`);
                  showToast("Erreur lors du chargement de la candidature.", 'error');
             }
         }

          // Gère la sauvegarde (ajout ou modification) d'une candidature
          function saveApplication() {
               if (!applicationForm) return;

              // Récupérer les valeurs des champs (utilise optional chaining et trim)
              const company = document.getElementById('company')?.value.trim();
              const position = document.getElementById('position')?.value.trim();
              const date = document.getElementById('date')?.value; // Date peut être vide si non requise (mais ici elle l'est)
              const status = document.getElementById('status')?.value;
              const notes = document.getElementById('notes')?.value.trim();
              const contactName = document.getElementById('contactName')?.value.trim();
              const contactEmail = document.getElementById('contactEmail')?.value.trim();
              const contactPhone = document.getElementById('contactPhone')?.value.trim();


              // Validation simple des champs obligatoires (adaptez selon vos besoins)
              if (!company || !position || !date || !status) {
                  showToast("Veuillez remplir les champs marqués d'une *.", 'error');
                  // Optionnel : mettre un focus sur le premier champ vide
                  if (!company) document.getElementById('company')?.focus();
                  else if (!position) document.getElementById('position')?.focus();
                  else if (!date) document.getElementById('date')?.focus();
                  else if (!status) document.getElementById('status')?.focus();
                  return; // Arrête la fonction si les champs sont vides
              }

             if (dialogMode === 'add') {
                   const newApplication = {
                       id: Date.now().toString(), // Génère un ID unique simple (timestamp)
                       company: company,
                       position: position,
                       date: date,
                       status: status,
                       notes: notes,
                       contactName: contactName,
                       contactEmail: contactEmail,
                       contactPhone: contactPhone
                   };
                   applicationsData.push(newApplication); // Ajouter à la liste
                   showToast("Candidature ajoutée avec succès !", 'success');
               } else { // Mode 'edit'
                  const applicationIndex = applicationsData.findIndex(app => app.id === currentApplicationId);
                  if (applicationIndex !== -1) {
                      // Créer un nouvel objet pour éviter de modifier l'original directement
                      applicationsData[applicationIndex] = {
                          ...applicationsData[applicationIndex], // Conserve les propriétés existantes (comme l'id)
                          company: company,
                          position: position,
                          date: date,
                          status: status,
                          notes: notes,
                          contactName: contactName,
                          contactEmail: contactEmail,
                          contactPhone: contactPhone
                      };
                       showToast("Candidature modifiée avec succès !", 'success');
                  } else {
                      console.error(`Erreur: Candidature avec l'ID ${currentApplicationId} non trouvée pour modification.`);
                       showToast("Erreur lors de la modification de la candidature.", 'error');
                  }
               }

             localStorage.setItem('emploiavenir_candidatures', JSON.stringify(applicationsData)); // Sauvegarder dans localStorage
             closeDialog(); // Fermer la modale
             renderApplications(); // Rafraîchir l'affichage de la liste
          }


          // Supprime une candidature
          function deleteApplication(applicationId) {
              const initialLength = applicationsData.length;
              applicationsData = applicationsData.filter(app => app.id !== applicationId); // Filtrer pour retirer

              if (applicationsData.length < initialLength) { // Vérifie si un élément a été retiré
                  localStorage.setItem('emploiavenir_candidatures', JSON.stringify(applicationsData)); // Sauvegarde
                  renderApplications(); // Rafraîchit l'affichage
                  showToast("Candidature supprimée.", 'success');
              } else {
                   showToast("Erreur: La candidature n'a pas été trouvée.", 'error');
              }
          }

          // Met à jour le statut d'une candidature
          function updateApplicationStatus(applicationId, newStatus) {
               const application = applicationsData.find(app => app.id === applicationId);
               if (application) {
                   application.status = newStatus; // Mettre à jour le statut dans le tableau
                   localStorage.setItem('emploiavenir_candidatures', JSON.stringify(applicationsData)); // Sauvegarde
                   renderApplications(); // Rafraîchit l'affichage (important pour mettre à jour le badge)
                    showToast("Statut de la candidature mis à jour.", 'success');
               } else {
                   console.error(`Erreur: Candidature avec l'ID ${applicationId} non trouvée pour mise à jour du statut.`);
                    showToast("Erreur lors de la mise à jour du statut.", 'error');
               }
          }


        // --- Initialisation de la page Mes Candidatures ---

        // Ajouter l'écouteur pour le bouton "Ajouter une candidature"
        if (addApplicationButton) {
             addApplicationButton.addEventListener('click', () => {
                 openDialog('add'); // Ouvrir le dialog en mode ajout
             });
        }


        // Écouteurs pour les boutons du dialog (Annuler et Sauvegarder)
        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                closeDialog(); // Fermer le dialog
            });
        }

        if (saveButton) {
             // Écouteur pour le bouton de sauvegarde (appellera saveApplication)
             saveButton.addEventListener('click', () => {
                 saveApplication();
             });
        }

        // Gérer la fermeture du dialog en cliquant en dehors ou avec Échap
        if (applicationDialog) {
             applicationDialog.addEventListener('click', (event) => {
                 if (event.target === applicationDialog) { // Si on clique directement sur le fond gris
                     closeDialog();
                 }
             });
              window.addEventListener('keydown', (event) => {
                  if (event.key === 'Escape' && applicationDialog.classList.contains('open')) { // Vérifie si la modale est ouverte
                      closeDialog();
                  }
              });
        }


        renderApplications(); // Affiche la liste initiale des candidatures au chargement


    } // Fin de initCandidaturesPage


    // Logique de la page Profil
    function initProfilPage() {
         // Vérifie si c'est la page Profil
         const profileGrid = document.querySelector('.profile-grid');
         if (!profileGrid) return; // Quitte si les éléments ne sont pas présents

         // --- Références DOM spécifiques à Profil ---
         const saveChangesButton = document.getElementById('saveChangesButton');
         const changePasswordButton = document.getElementById('changePasswordButton');
         const exportDataButton = document.getElementById('exportDataButton');
         const deleteAccountButton = document.getElementById('deleteAccountButton');
         const personalInfoForm = document.getElementById('personalInfoForm');
         const changePasswordForm = document.getElementById('changePasswordForm');

         // --- Éléments des switchs (pour exemple) ---
         const notificationsSwitch = document.getElementById('notifications');
         const accessibilitySwitch = document.getElementById('accessibility');
         const remindersSwitch = document.getElementById('reminders');


         // --- Fonctions de gestion ---

         // Fonction pour charger les données utilisateur (simulée)
         function loadUserData() {
              // Dans un vrai site, ces données viendraient d'une API après connexion
             const userData = {
                 firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@example.com',
                 phone: '06 12 34 56 78', address: '15 rue de la Paix', city: 'Paris', postalCode: '75001',
                 settings: { notifications: true, accessibility: false, reminders: true }
             };

             // Remplir les champs du formulaire d'infos personnelles si le formulaire existe
             if(personalInfoForm) {
                 document.getElementById('firstName').value = userData.firstName || '';
                 document.getElementById('lastName').value = userData.lastName || '';
                 document.getElementById('email').value = userData.email || '';
                 document.getElementById('phone').value = userData.phone || '';
                 document.getElementById('address').value = userData.address || '';
                 document.getElementById('city').value = userData.city || '';
                 document.getElementById('postalCode').value = userData.postalCode || '';
             }

              // Définir l'état des switchs si les éléments existent
              if(notificationsSwitch) notificationsSwitch.checked = userData.settings.notifications;
              if(accessibilitySwitch) accessibilitySwitch.checked = userData.settings.accessibility;
              if(remindersSwitch) remindersSwitch.checked = userData.settings.reminders;

             console.log("Données utilisateur chargées (simulé).");
         }

         // Fonction pour sauvegarder les modifications (simulée)
         function saveProfileChanges() {
             if (!personalInfoForm) return;

             // Collecter les données du formulaire d'infos personnelles
             const personalData = {
                 firstName: document.getElementById('firstName').value.trim(),
                 lastName: document.getElementById('lastName').value.trim(),
                 email: document.getElementById('email').value.trim(),
                 phone: document.getElementById('phone').value.trim(),
                 address: document.getElementById('address').value.trim(),
                 city: document.getElementById('city').value.trim(),
                 postalCode: document.getElementById('postalCode').value.trim()
             };

             // Collecter l'état des paramètres des switchs
              const settingsData = {
                 notifications: notificationsSwitch ? notificationsSwitch.checked : false,
                 accessibility: accessibilitySwitch ? accessibilitySwitch.checked : false,
                 reminders: remindersSwitch ? remindersSwitch.checked : false
             };

             console.log("Simuler l'envoi des données de profil et paramètres au serveur:", { personalData, settingsData });

             // Dans un vrai site:
             // fetch('/api/update-profile', { method: 'POST', body: JSON.stringify({ personalData, settingsData }), headers: { 'Content-Type': 'application/json' } })
             // .then(response => response.json())
             // .then(data => {
             //    if (data.success) { showToast("Profil mis à jour : Vos modifications ont été enregistrées.", 'success'); }
             //    else { showToast("Erreur lors de la mise à jour du profil.", 'error'); }
             // })
             // .catch(error => { console.error('Error:', error); showToast("Une erreur est survenue.", 'error'); });

             // Pour la démo:
             showToast("Profil mis à jour : Vos modifications ont été enregistrées (simulé).", 'success');
         }

         // Fonction pour changer le mot de passe (simulée)
         function handleChangePassword() {
             if (!changePasswordForm) return;

             const currentPassword = document.getElementById('currentPassword').value;
             const newPassword = document.getElementById('newPassword').value;
             const confirmPassword = document.getElementById('confirmPassword').value;

             // Validation basique côté client (une validation côté serveur est ESSENTIELLE)
             if (!currentPassword || !newPassword || !confirmPassword) {
                 showToast("Veuillez remplir tous les champs de mot de passe.", 'error');
                 return;
             }
             if (newPassword !== confirmPassword) {
                 showToast("Le nouveau mot de passe et sa confirmation ne correspondent pas.", 'error');
                 // Optionnel : vider les champs du nouveau mot de passe
                 document.getElementById('newPassword').value = '';
                 document.getElementById('confirmPassword').value = '';
                 document.getElementById('newPassword').focus(); // Mettre le focus pour corriger
                 return;
             }
             if (newPassword.length < 8) { // Exemple: minimum 8 caractères
                 showToast("Le nouveau mot de passe doit contenir au moins 8 caractères.", 'error');
                  document.getElementById('newPassword').focus();
                 return;
             }

              // Dans un vrai site:
              // fetch('/api/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }), headers: { 'Content-Type': 'application/json' } })
              // .then(response => response.json())
              // .then(data => {
              //    if (data.success) {
              //        showToast("Mot de passe mis à jour : Votre mot de passe a été changé.", 'success');
              //        changePasswordForm.reset(); // Vider les champs après succès
              //    }
              //    else { showToast("Erreur lors du changement de mot de passe. Vérifiez votre mot de passe actuel.", 'error'); }
              // })
              // .catch(error => { console.error('Error:', error); showToast("Une erreur est survenue.", 'error'); });


             // Pour la démo:
             console.log("Simuler le changement de mot de passe...");
             changePasswordForm.reset(); // Vider les champs après succès simulé
             showToast("Mot de passe mis à jour : Votre mot de passe a été changé (simulé).", 'success');
         }

         // Fonction pour exporter les données (simulée)
         function handleExportData() {
             console.log("Simuler l'export des données...");
             showToast("Export de vos données demandé (simulé).", 'info');
             // Dans un vrai site: déclencher un téléchargement de fichier (JSON, CSV, etc.)
             // Exemple: window.location.href = '/api/export-userdata';
         }

         // Fonction pour supprimer le compte (simulée)
         function handleDeleteAccount() {
             // Confirmation avant une action destructive !
             if (confirm("ATTENTION : Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.")) {
                  console.log("Simuler la suppression du compte...");
                  showToast("Suppression du compte en cours (simulé).", 'warning'); // Message avant action

                  // Dans un vrai site:
                  // fetch('/api/delete-account', { method: 'POST' })
                  // .then(response => response.json())
                  // .then(data => {
                  //    if (data.success) {
                  //        showToast("Votre compte a été supprimé.", 'success');
                  //        // Rediriger l'utilisateur, par exemple vers la page d'accueil ou une page de confirmation
                  //        setTimeout(() => { window.location.href = 'index.html'; }, 2000);
                  //    }
                  //    else { showToast("Erreur lors de la suppression du compte.", 'error'); }
                  // })
                  // .catch(error => { console.error('Error:', error); showToast("Une erreur est survenue.", 'error'); });


                  // Pour la démo:
                   showToast("Votre compte a été supprimé (simulé). Redirection...", 'success');
                   // Redirection simulée après un petit délai
                   setTimeout(() => { window.location.href = 'index.html'; }, 2000);

             }
         }


        // --- Initialisation de la page Profil ---

        loadUserData(); // Charger les données utilisateur au chargement

        // Ajouter les écouteurs d'événements aux boutons
        if (saveChangesButton) saveChangesButton.addEventListener('click', saveProfileChanges);
        if (changePasswordButton) changePasswordButton.addEventListener('click', handleChangePassword);
        if (exportDataButton) exportDataButton.addEventListener('click', handleExportData);
        if (deleteAccountButton) deleteAccountButton.addEventListener('click', handleDeleteAccount);

         // Les switchs ont des écouteurs 'change' dans le script commun si besoin d'agir immédiatement.
         // Si leur état n'est sauvegardé qu'au clic sur "Enregistrer les modifications",
         // vous n'avez pas besoin d'écouteurs 'change' ici, juste de lire leur état dans saveProfileChanges().
         // Si vous voulez sauvegarder chaque changement de switch, les écouteurs sont nécessaires.
         // Ici, ils sont déjà gérés dans le script commun pour l'exemple de toast.


    } // Fin de initProfilPage


    // Logique de la page Partenaires
    function initPartenairesPage() {
        // Vérifie si c'est la page Partenaires
        const tabsList = document.querySelector('.tabs-list');
        if (!tabsList) return; // Quitte si les éléments ne sont pas présents

        // --- Références DOM spécifiques à Partenaires ---
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        const searchQueryInput = document.getElementById('searchQuery'); // Corrigé ID
        const categoryFilterSelect = document.getElementById('categoryFilter'); // Corrigé ID
        const partnerListContainer = document.getElementById('partner-list');
        const noPartnersMessage = document.getElementById('no-results'); // Message "Aucun partenaire" (utilise la classe no-results) - Assurez-vous d'avoir un élément avec cet ID ou cette classe.
        const appointmentForm = document.getElementById('appointmentForm');
        const appointmentFormPartnerSelect = document.getElementById('partner'); // Select partenaire dans le formulaire RDV
        const appointmentDateInput = document.getElementById('date'); // Corrigé ID
        const appointmentTimeInput = document.getElementById('time'); // Corrigé ID
        const appointmentTypeSelect = document.getElementById('type'); // Corrigé ID
        const appointmentNotesInput = document.getElementById('notes'); // Corrigé ID
        const appointmentListContainer = document.getElementById('appointment-list');
        const noAppointmentsMessageEl = document.getElementById('no-appointments-message'); // Message si pas de RDV (ID ajouté dans HTML)
        const goToPartnersTabButton = document.getElementById('go-to-partners-tab'); // Bouton dans le message vide RDV (ID ajouté dans HTML)


        // --- Données spécifiques à Partenaires ---
        // Données des partenaires (devraient venir d'une API)
         const partnersData = [
             { id: '1', name: 'France Travail', category: 'emploi', description: "L'organisme public pour l'emploi en France", services: ["Accompagnement personnalisé", "Offres d'emploi", "Ateliers de recherche"], address: '15 rue de Paris, 75001 Paris', phone: '3949', email: 'contact@francetravail.fr', website: 'https://www.francetravail.fr', logoUrl: 'Images/FranceTravail.webp' },
             { id: '2', name: 'Croix-Rouge française', category: 'accompagnement', description: "Association d'aide humanitaire", services: ['Accompagnement social', 'Aide alimentaire', 'Insertion professionnelle'], address: '86 rue Didot, 75014 Paris', phone: '01 44 43 11 00', email: 'contact@croix-rouge.fr', website: 'https://www.croix-rouge.fr', logoUrl: 'Images/CroixRougeFR.png' },
             { id: '3', name: 'AFPA', category: 'formation', description: 'Centre de formation professionnelle pour adultes', services: ['Formation professionnelle', 'Certification', 'Reconversion'], address: '3 rue Franklin, 93100 Montreuil', phone: '3936', email: 'contact@afpa.fr', website: 'https://www.afpa.fr', logoUrl: 'Images/Afpa.png' },
             { id: '4', name: 'Mission Locale', category: 'insertion', description: 'Accompagnement des jeunes dans leur insertion professionnelle', services: ["Conseil en orientation", "Aide à la recherche d'emploi", 'Accompagnement social'], address: '34 rue Nationale, 75013 Paris', phone: '01 44 97 28 85', website: 'https://www.mission-locale.fr', logoUrl: 'Images/MissionLocale.png' }
         ];

         // Données des rendez-vous (stockées localement pour la démo)
         let appointmentsData = JSON.parse(localStorage.getItem('emploiavenir_appointments')) || [
             { id: 'rdv_init_1', partnerId: '1', partnerName: 'France Travail', date: '2025-04-15', time: '14:30', type: 'présentiel', notes: 'Apporter CV et pièce d\'identité' }
         ];


        // --- Mappage des catégories pour l'affichage ---
        const categoryLabels = {
             'all': 'Toutes les catégories', // Pour le filtre
             'emploi': "Recherche d'emploi",
             'formation': 'Formation',
             'insertion': 'Insertion professionnelle',
             'accompagnement': 'Accompagnement social',
             'aide': 'Aide aux démarches'
         };

        // --- Mappage des types de rendez-vous pour les badges ---
        const appointmentTypeBadges = {
            'présentiel': 'badge-presentiel',
            'téléphonique': 'badge-telephonique',
            'visioconférence': 'badge-visioconference'
        };


        // --- Variables d'état pour les filtres ---
         let searchQuery = '';
         let categoryFilter = 'all';


        // --- Fonctions d'affichage (Rendering) ---

        function renderPartners() {
            if (!partnerListContainer || !noPartnersMessage) return;

            const filteredPartners = partnersData.filter(partner => {
                const query = searchQueryInput.value.toLowerCase(); // Récupère la valeur la plus récente
                const category = categoryFilterSelect.value; // Récupère la valeur la plus récente

                const nameMatch = escapeHTML(partner.name).toLowerCase().includes(query);
                const descriptionMatch = escapeHTML(partner.description).toLowerCase().includes(query);
                const servicesMatch = Array.isArray(partner.services) && partner.services.some(service => escapeHTML(service).toLowerCase().includes(query));

                const matchesSearch = nameMatch || descriptionMatch || servicesMatch;
                const matchesCategory = category === 'all' || partner.category === category;
                return matchesSearch && matchesCategory;
            });

            partnerListContainer.innerHTML = ''; // Vider la liste actuelle

            if (filteredPartners.length === 0) {
                noPartnersMessage.style.display = 'block';
                partnerListContainer.style.display = 'none'; // Cache la grille
                return;
            }

            noPartnersMessage.style.display = 'none';
            partnerListContainer.style.display = 'grid'; // Assure que le conteneur est visible

            filteredPartners.forEach(partner => {
                 const cardHTML = `
                     <article class="card partner-card" data-partner-id="${escapeHTML(partner.id)}">
                         <div class="card-header">
                             <div class="flex justify-between items-start w-full"> <!-- Utiliser w-full pour que le flex prenne toute la largeur -->
                                 <div>
                                     <h3 class="card-title">${escapeHTML(partner.name)}</h3>
                                     <!-- Utilise la catégorie pour la classe du badge -->
                                     <span class="badge badge-${escapeHTML(partner.category) || 'default'}">${escapeHTML(categoryLabels[partner.category] || partner.category || 'Catégorie inconnue')}</span>
                                 </div>
                                 ${partner.logoUrl ? `
                                     <div class="logo" aria-hidden="true">
                                         <img src="${escapeHTML(partner.logoUrl)}" alt="Logo ${escapeHTML(partner.name)}" loading="lazy">
                                     </div>
                                 ` : ''}
                             </div>
                         </div>
                         <div class="card-content">
                             <p class="description">${escapeHTML(partner.description)}</p>
                             <div class="contact-info">
                                 ${partner.address ? `<div><i class="fas fa-map-marker-alt" aria-hidden="true"></i><span>${escapeHTML(partner.address)}</span></div>` : ''}
                                 ${partner.phone ? `<div><i class="fas fa-phone" aria-hidden="true"></i><span>${escapeHTML(partner.phone)}</span></div>` : ''}
                                 ${partner.email ? `<div><i class="fas fa-envelope" aria-hidden="true"></i><span>${escapeHTML(partner.email)}</span></div>` : ''}
                                 ${partner.website ? `<div><i class="fas fa-globe" aria-hidden="true"></i><a href="${escapeHTML(partner.website)}" target="_blank" rel="noopener noreferrer">${escapeHTML(partner.website)}</a></div>` : ''}
                             </div>
                             ${Array.isArray(partner.services) && partner.services.length > 0 ? `
                                 <div class="services">
                                     <p>Services proposés :</p>
                                     <ul>
                                         ${partner.services.map(service => `<li>${escapeHTML(service)}</li>`).join('')}
                                     </ul>
                                 </div>
                             ` : ''}
                         </div>
                         <div class="card-footer">
                             <button type="button" class="button button-primary take-appointment-btn" data-partner-id="${escapeHTML(partner.id)}" data-partner-name="${escapeHTML(partner.name)}" aria-label="Prendre rendez-vous avec ${escapeHTML(partner.name)}">Prendre rendez-vous</button>
                         </div>
                     </article>
                 `;
                 partnerListContainer.innerHTML += cardHTML; // Ajoute la carte à la grille
             });
             // Les écouteurs sont gérés par délégation sur le conteneur parent
         }


         function renderAppointmentOptions() {
              if (!appointmentFormPartnerSelect) return;
             appointmentFormPartnerSelect.innerHTML = '<option value="">Choisir un partenaire</option>'; // Vide et ajoute l'option par défaut
             partnersData.forEach(partner => {
                 const option = document.createElement('option');
                 option.value = escapeHTML(partner.id);
                 option.textContent = escapeHTML(partner.name);
                 appointmentFormPartnerSelect.appendChild(option);
             });
         }


         function renderAppointments() {
             if (!appointmentListContainer || !noAppointmentsMessageEl) return;

             appointmentListContainer.innerHTML = ''; // Vide la liste actuelle

             if (appointmentsData.length === 0) {
                 appointmentListContainer.style.display = 'none'; // Cache la grille
                 noAppointmentsMessageEl.style.display = 'block'; // Affiche le message vide
                 // Le bouton "Prendre un rendez-vous" dans le message vide est géré par délégation
                 return; // Arrête la fonction ici
             }

             // S'il y a des rendez-vous, les trier (optionnel)
             appointmentsData.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));


             // S'il y a des rendez-vous
             appointmentListContainer.style.display = 'flex'; // ou grid/block selon le style
             noAppointmentsMessageEl.style.display = 'none'; // Cache le message vide


             appointmentsData.forEach(appointment => {
                  // Trouver le nom du partenaire si non stocké directement (sécurité si les données changent)
                  const partner = partnersData.find(p => p.id === appointment.partnerId);
                  const partnerName = partner ? partner.name : 'Partenaire Inconnu';
                  // Gérer le type de badge pour l'affichage
                   const appointmentTypeClass = appointmentTypeBadges[appointment.type] || 'badge-default';
                   const displayType = appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1); // Capitalise la première lettre

                  const appointmentHTML = `
                      <article class="card appointment-card" data-appointment-id="${escapeHTML(appointment.id)}">
                          <div class="appointment-details">
                              <div class="appointment-info">
                                  <h3>${escapeHTML(partnerName)}</h3>
                                  <div class="date-time">
                                      <i class="fas fa-calendar-alt" aria-hidden="true"></i>
                                      <span>${new Date(appointment.date).toLocaleDateString('fr-FR')} à ${escapeHTML(appointment.time)}</span>
                                  </div>
                                   <!-- Utilise appointmentTypeBadges pour la classe du badge -->
                                  <span class="badge ${appointmentTypeClass}">${escapeHTML(displayType)}</span>
                              </div>
                              <!-- Bouton Annuler -->
                              <button type="button" class="button button-destructive cancel-appointment-btn" data-appointment-id="${escapeHTML(appointment.id)}" aria-label="Annuler le rendez-vous avec ${escapeHTML(partnerName)} le ${new Date(appointment.date).toLocaleDateString('fr-FR')}">Annuler</button>
                          </div>
                          ${appointment.notes ? `<div class="notes"><p>${escapeHTML(appointment.notes)}</p></div>` : ''}
                      </article>
                  `;
                 appointmentListContainer.innerHTML += appointmentHTML; // Ajoute la carte rendez-vous
             });
             // Les écouteurs pour annuler sont gérés par délégation
         }


        // --- Fonctions de gestion des Onglets ---

         function switchToTab(tabId) {
             // Sélectionner tous les boutons et contenus d'onglets
             const tabButtons = document.querySelectorAll('.tab-button');
             const tabContents = document.querySelectorAll('.tab-content');

             // Désactiver tous les onglets et contenus
             tabButtons.forEach(button => {
                 button.classList.remove('active');
                 button.setAttribute('aria-selected', 'false');
             });
             tabContents.forEach(content => {
                 content.classList.remove('active');
                 content.setAttribute('aria-hidden', 'true'); // Cacher sémantiquement
             });


             // Activer l'onglet et le contenu correspondant à tabId
             const selectedButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
             const selectedContent = document.getElementById(tabId + '-tab-content'); // ID basé sur le data-tab

             if (selectedButton && selectedContent) {
                 selectedButton.classList.add('active');
                 selectedButton.setAttribute('aria-selected', 'true');
                 selectedContent.classList.add('active');
                 selectedContent.setAttribute('aria-hidden', 'false'); // Montrer sémantiquement

                 // Pour les lecteurs d'écran, déplacer le focus vers le contenu activé
                 // S'assure que le contenu peut recevoir le focus
                 selectedContent.setAttribute('tabindex', '-1');
                 selectedContent.focus(); // Déplacer le focus
                 selectedContent.removeAttribute('tabindex'); // Retirer tabindex une fois focusé (optionnel selon le besoin)

                 // Si on bascule vers l'onglet "Mes rendez-vous", rafraîchir la liste
                 if (tabId === 'appointments') {
                     renderAppointments();
                 } else if (tabId === 'partners') {
                     // Si on bascule vers l'onglet "Partenaires", s'assurer que le formulaire est visible (si c'est bien dans cet onglet)
                     const formElement = document.getElementById('appointment-form'); // Le conteneur du formulaire
                     if(formElement) formElement.style.display = 'block'; // Ou flex/grid selon votre CSS initial
                 }
             }
             // Permettre un appel depuis l'extérieur du script (ex: bouton sur la page d'accueil)
             window.switchToTab = switchToTab;
         }


         // --- Fonctions de gestion du Formulaire de Rendez-vous ---

         function handleAppointmentSubmit(event) {
             event.preventDefault(); // Empêche la soumission classique du formulaire (rechargement de la page)

             // Récupérer les valeurs du formulaire (utilise optional chaining)
             const partnerId = appointmentFormPartnerSelect?.value;
             const date = document.getElementById('date')?.value; // ID corrigé
             const time = document.getElementById('time')?.value; // ID corrigé
             const type = document.getElementById('type')?.value; // ID corrigé
             const notes = document.getElementById('notes')?.value.trim(); // ID corrigé


             // Validation des champs obligatoires
             if (!partnerId || !date || !time || !type) {
                 showToast("Formulaire incomplet : Veuillez remplir tous les champs obligatoires.", 'error');
                 // Mettre un focus sur le premier champ vide pour aider l'utilisateur
                 if (!partnerId) appointmentFormPartnerSelect.focus();
                 else if (!date) document.getElementById('date')?.focus();
                 else if (!time) document.getElementById('time')?.focus();
                 else if (!type) document.getElementById('type')?.focus();
                 return; // Arrête la fonction si les champs sont vides
             }

             // Vérifier si la date et l'heure sont dans le futur (basique)
             const selectedDateTime = new Date(`${date}T${time}`);
             const now = new Date();
             if (selectedDateTime < now) {
                 showToast("Erreur : La date et l'heure du rendez-vous doivent être dans le futur.", 'error');
                 document.getElementById('date')?.focus(); // Focus sur le champ date
                 return;
             }


             // Trouver le partenaire par son ID pour stocker son nom
             const partner = partnersData.find(p => p.id === partnerId);
             const partnerName = partner ? partner.name : 'Partenaire Inconnu';

             // Créer le nouvel objet rendez-vous
             const newAppointment = {
                 id: `rdv_${Date.now()}`, // ID unique basé sur le timestamp
                 partnerId: partnerId,
                 partnerName: partnerName, // Stocker le nom pour simplifier l'affichage
                 date: date,
                 time: time,
                 type: type,
                 notes: notes
             };

             appointmentsData.push(newAppointment); // Ajouter le nouveau rendez-vous au tableau

             // Réinitialiser le formulaire
             if (appointmentForm) appointmentForm.reset();
             // Réinitialiser la sélection du partenaire
             if (appointmentFormPartnerSelect) appointmentFormPartnerSelect.value = "";


             // Sauvegarder les rendez-vous mis à jour dans le stockage local
             saveAppointmentsToLocalStorage();

             renderAppointments(); // Rafraîchir l'affichage de la liste des rendez-vous
             switchToTab('appointments'); // Basculer automatiquement vers l'onglet "Mes rendez-vous"

             showToast(`Rendez-vous enregistré avec ${escapeHTML(partnerName)} le ${new Date(date).toLocaleDateString('fr-FR')} à ${escapeHTML(time)}.`, 'success');
         }

         // Gère l'annulation d'un rendez-vous
         function cancelAppointment(appointmentId) {
             // Filtrer le tableau pour retirer le rendez-vous avec l'ID correspondant
             const initialLength = appointmentsData.length;
             appointmentsData = appointmentsData.filter(app => app.id !== appointmentId);

             if (appointmentsData.length < initialLength) {
                 // Seulement si un élément a été effectivement retiré
                 saveAppointmentsToLocalStorage(); // Sauvegarder les rendez-vous mis à jour
                 renderAppointments(); // Rafraîchir l'affichage
                 showToast("Rendez-vous annulé.", 'success');
             } else {
                  showToast("Erreur : Le rendez-vous n'a pas été trouvé.", 'error');
             }
         }

         // Fonction pour sauvegarder les rendez-vous dans le stockage local
         function saveAppointmentsToLocalStorage() {
             try {
                localStorage.setItem('emploiavenir_appointments', JSON.stringify(appointmentsData));
             } catch (e) {
                 console.error("Erreur en sauvegardant les rendez-vous dans le stockage local", e);
                  showToast("Impossible de sauvegarder votre rendez-vous localement.", 'error');
             }
         }

        // --- Délégation d'événements pour les boutons Annuler ---
        function addAppointmentButtonListeners() {
             if (!appointmentListContainer) return;

             // On n'attache l'écouteur qu'une seule fois sur le conteneur parent
             appointmentListContainer.addEventListener('click', function(event) {
                 const targetButton = event.target.closest('.cancel-appointment-btn'); // Trouve le bouton Annuler cliqué
                 if (targetButton) {
                     const appointmentId = targetButton.dataset.appointmentId;
                     if (appointmentId) {
                         // Confirmation avant annulation
                         if (confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) {
                            cancelAppointment(appointmentId);
                         }
                     }
                 }
             });
         }


         // --- Initialisation de la page Partenaires ---

        // Remplir le select des partenaires dans le formulaire de RDV
        renderAppointmentOptions();

         // Initialiser la date minimale pour le champ date (aujourd'hui)
        if (appointmentDateInput) {
             appointmentDateInput.min = new Date().toISOString().split('T')[0];
        }

        // Initialiser l'affichage des partenaires (tous, pas de filtre au départ)
        renderPartners(partnersData);

        // Initialiser l'affichage des rendez-vous (charge depuis localStorage)
        renderAppointments();

        // Initialiser les écouteurs pour les filtres (recherche et catégorie)
         if (searchQueryInput) {
            searchQueryInput.addEventListener('input', renderPartners); // Appelle renderPartners à chaque input
         }
         if (categoryFilterSelect) {
            categoryFilterSelect.addEventListener('change', renderPartners); // Appelle renderPartners au changement
         }

        // Initialiser l'écouteur pour la soumission du formulaire de rendez-vous
         if (appointmentForm) {
            appointmentForm.addEventListener('submit', handleAppointmentSubmit);
         }

        // Initialiser l'écouteur d'événements par délégation pour les boutons "Prendre rendez-vous" sur les cartes partenaires
         if (partnerListContainer) {
            partnerListContainer.addEventListener('click', handleTakeAppointmentClick);
         }

        // Initialiser l'écouteur d'événements par délégation pour les boutons "Annuler" sur les cartes rendez-vous
        addAppointmentButtonListeners(); // Appelle la fonction pour attacher l'écouteur de délégation


        // Initialiser l'écouteur pour les clics sur les boutons d'onglet
         if (tabsList) {
            tabsList.addEventListener('click', handleTabClick);
             // Sélectionner le premier onglet par défaut au chargement
             switchToTab('partners'); // Assure que l'onglet partenaires est actif au début
         }

         // Initialiser l'écouteur pour le bouton "Prendre un rendez-vous" dans le message "pas de rendez-vous"
         if (goToPartnersTabButton) {
              goToPartnersTabButton.addEventListener('click', function() {
                  switchToTab('partners'); // Bascule vers l'onglet partenaires
              });
         }

    } // Fin de initPartenairesPage

// Logique de la page Évaluation (Quizz Express)
function initEvaluationPage() {
    // Vérifie si c'est la page Évaluation en cherchant un élément clé
    const evaluationForm = document.getElementById('evaluationForm');
    if (!evaluationForm) return; // Quitte la fonction si les éléments ne sont pas présents

    console.log("Initialisation de la page d'évaluation...");

    // --- Références DOM spécifiques à l'évaluation ---
    const quizStepsContainer = document.getElementById('quizSteps');
    const quizSteps = quizStepsContainer ? quizStepsContainer.querySelectorAll('.quiz-step') : [];
    const currentQuizQuestionSpan = document.getElementById('currentQuizQuestion');
    const totalQuizQuestionsSpan = document.getElementById('totalQuizQuestions');
    const prevStepButton = document.getElementById('prevStepButton');
    const nextStepButton = document.getElementById('nextStepButton');
    const submitQuizButton = document.getElementById('submitQuizButton');
    const goToParcoursButton = document.getElementById('goToParcoursButton'); // Bouton dans l'étape finale

    if (quizSteps.length === 0 || !currentQuizQuestionSpan || !totalQuizQuestionsSpan || !prevStepButton || !nextStepButton || !submitQuizButton || !goToParcoursButton) {
        console.error("Éléments DOM du quiz manquants !");
        return; // Assure que tous les éléments nécessaires existent
    }

    // --- Variables d'état ---
    // L'index commence à 0 pour la première étape
    let currentStepIndex = 0;
     // Le nombre total d'étapes *de questions* (avant le message final)
    const totalQuestionSteps = 4; // Étapes 1 à 4

    // Objet pour stocker les réponses collectées
    let quizResponses = {};

    // --- Fonctions de gestion du quiz ---

    // Met à jour l'affichage (quelle étape montrer, quels boutons afficher, indicateur)
    function updateQuizUI() {
        // Masque toutes les étapes
        quizSteps.forEach((step, index) => {
            step.classList.remove('active');
            step.style.display = 'none'; // Cache visuellement
            step.setAttribute('aria-hidden', 'true'); // Cache sémantiquement
        });

        // Affiche l'étape actuelle
        const currentStep = quizSteps[currentStepIndex];
        if (currentStep) {
            currentStep.classList.add('active');
            currentStep.style.display = 'block'; // Ou 'flex'/'grid' selon le layout souhaité
            currentStep.removeAttribute('aria-hidden'); // Rends le contenu visible sémantiquement

            // Déplace le focus vers le premier élément interactif de l'étape actuelle pour l'accessibilité
            const firstFocusableElement = currentStep.querySelector('input, select, button, a');
            if (firstFocusableElement) {
                firstFocusableElement.focus();
            }
        }

        // Met à jour l'indicateur de progression
         if (currentStepIndex < totalQuestionSteps) {
             // Si on est sur une étape de question (1 à 4)
             currentQuizQuestionSpan.textContent = currentStepIndex + 1; // Index 0 -> Question 1, etc.
             totalQuizQuestionsSpan.textContent = totalQuestionSteps; // Total des questions
             // S'assure que l'indicateur est visible
             currentQuizQuestionSpan.parentElement.style.display = 'block';
         } else {
              // Si on est sur l'étape finale (message)
             currentQuizQuestionSpan.parentElement.style.display = 'none'; // Cache l'indicateur de progression
         }


        // Gère la visibilité des boutons de navigation
        if (currentStepIndex === 0) {
            // Première étape : cacher "Précédent"
            prevStepButton.style.visibility = 'hidden'; // visibility pour maintenir l'espace
        } else {
            // Autres étapes : afficher "Précédent"
            prevStepButton.style.visibility = 'visible';
        }

        if (currentStepIndex < totalQuestionSteps - 1) {
            // Étapes avant la dernière question (1 à 3) : afficher "Suivant", cacher "Terminer" et "Accéder"
            nextStepButton.style.display = 'block';
            submitQuizButton.style.display = 'none';
            goToParcoursButton.style.display = 'none';
             // Cacher aussi le conteneur des boutons Précédent/Suivant/Terminer si on est à l'étape finale
             evaluationForm.querySelector('.form-navigation').style.display = 'flex';

        } else if (currentStepIndex === totalQuestionSteps - 1) {
            // Dernière étape de question (étape 4) : cacher "Suivant", afficher "Terminer", cacher "Accéder"
            nextStepButton.style.display = 'none';
            submitQuizButton.style.display = 'block'; // Le bouton de soumission apparaît
            goToParcoursButton.style.display = 'none';
             evaluationForm.querySelector('.form-navigation').style.display = 'flex';

        } else {
            // Étape finale (message, index == totalQuestionSteps) : cacher tous les boutons de navigation classiques
            prevStepButton.style.visibility = 'hidden';
            nextStepButton.style.display = 'none';
            submitQuizButton.style.display = 'none';
            goToParcoursButton.style.display = 'block'; // Le bouton "Accéder à mon parcours" apparaît
            // Cacher le conteneur des boutons Précédent/Suivant/Terminer à l'étape finale
             evaluationForm.querySelector('.form-navigation').style.display = 'none';
        }
    }

    // Valide les champs requis de l'étape actuelle
    function validateCurrentStep() {
        const currentStep = quizSteps[currentStepIndex];
        if (!currentStep) return false;

        // Sélectionne tous les champs requis dans l'étape actuelle (input, select, textarea)
        // Gère les groupes de radio (au moins un doit être coché)
        const requiredFields = currentStep.querySelectorAll('[required]');
        let allValid = true;

        requiredFields.forEach(field => {
            // Retire les éventuelles classes d'erreur précédentes
            field.classList.remove('input-error'); // Assurez-vous d'avoir un style pour .input-error dans style.css
            const errorId = field.id + '-error';
            const existingErrorMsg = document.getElementById(errorId);
            if (existingErrorMsg) existingErrorMsg.remove();


            let fieldValid = true;

            if (field.type === 'radio') {
                 // Pour les groupes de radio, on vérifie si au moins un est coché DANS ce groupe
                 const radioGroupName = field.name;
                 // On ne valide qu'une fois par groupe de radio, basé sur le premier radio trouvé dans le groupe
                 if (currentStep.querySelector(`input[name="${radioGroupName}"][type="radio"]:checked`)) {
                     // Au moins un radio est coché dans ce groupe
                     fieldValid = true;
                 } else {
                      // Aucun radio n'est coché dans ce groupe
                      fieldValid = false;
                 }
                 // On s'assure de ne valider le groupe qu'une fois en sautant les autres radios du même groupe
                 if (field !== currentStep.querySelector(`input[name="${radioGroupName}"][type="radio"]`)) {
                     return; // Passe à l'itération suivante si ce n'est pas le premier radio du groupe
                 }

             } else {
                  // Pour les autres champs (text, select, email, password, date, time...)
                  if (!field.value.trim()) {
                      fieldValid = false;
                  }
                  // Validation spécifique pour l'email si type="email"
                  if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) {
                       if (field.value.trim()) { // N'affiche l'erreur que si le champ n'est pas vide (déjà géré par required)
                            fieldValid = false; // Email invalide si non vide
                            // Optionnel: ajouter un message d'erreur plus spécifique pour l'email
                       }
                  }
                   // Validation spécifique pour le mot de passe (longueur min gérée par HTML5 minlength)
                   if (field.type === 'password') {
                       if (field.value.length < field.minLength) {
                            fieldValid = false;
                            // Optionnel: message d'erreur pour la longueur
                       }
                   }
             }


            if (!fieldValid) {
                 allValid = false; // Marque la validation globale comme échouée
                 field.classList.add('input-error'); // Ajoute une classe pour styler l'erreur
                 // Ajouter un message d'erreur à côté du champ (optionnel mais recommandé pour a11y)
                 const errorMsg = document.createElement('p');
                 errorMsg.id = errorId; // Lie le message au champ
                 errorMsg.classList.add('error-message'); // Classe CSS pour les messages d'erreur
                 errorMsg.textContent = "Ce champ est requis."; // Texte par défaut
                  if (field.type === 'email' && field.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) {
                      errorMsg.textContent = "Veuillez saisir une adresse email valide.";
                  } else if (field.type === 'password' && field.value.length < field.minLength) {
                       errorMsg.textContent = `Le mot de passe doit contenir au moins ${field.minLength} caractères.`;
                  } else if (field.type === 'radio') {
                       errorMsg.textContent = "Veuillez sélectionner une option.";
                  }


                 // Trouver où insérer le message d'erreur
                 const parentGroup = field.closest('.form-group, fieldset');
                 if (parentGroup) {
                      // Insère après le champ ou le groupe de radio
                     if (field.type === 'radio') {
                          // Insère après le fieldset du groupe radio
                          parentGroup.appendChild(errorMsg);
                     } else {
                         // Insère après le champ individuel
                          field.parentNode.insertBefore(errorMsg, field.nextSibling);
                     }

                 } else {
                     // Solution de secours si pas de .form-group (moins sémantique)
                      field.parentNode.insertBefore(errorMsg, field.nextSibling);
                 }

                 // Mettre le focus sur le premier champ invalide trouvé
                 if (!document.querySelector('.input-error')) {
                      field.focus();
                 }
            }
        });

        // Validation spécifique pour la confirmation de mot de passe (étape 4)
         if (currentStepIndex === 3) { // C'est l'étape 4 (index 3)
             const passwordField = document.getElementById('user-password');
             const confirmPasswordField = document.getElementById('confirm-password');
              // Retirer les éventuelles erreurs de confirmation précédentes
              confirmPasswordField.classList.remove('input-error');
              const confirmErrorId = confirmPasswordField.id + '-error';
              const existingConfirmErrorMsg = document.getElementById(confirmErrorId);
              if (existingConfirmErrorMsg) existingConfirmErrorMsg.remove();

              if (passwordField && confirmPasswordField && passwordField.value !== confirmPasswordField.value) {
                 allValid = false;
                 confirmPasswordField.classList.add('input-error');
                 const errorMsg = document.createElement('p');
                 errorMsg.id = confirmErrorId;
                 errorMsg.classList.add('error-message');
                 errorMsg.textContent = "Les mots de passe ne correspondent pas.";
                 confirmPasswordField.parentNode.insertBefore(errorMsg, confirmPasswordField.nextSibling);
                 // Mettre le focus sur le champ de confirmation si c'est la seule erreur ou la première
                 if (!document.querySelector('.input-error')) {
                       confirmPasswordField.focus();
                  }
              }
         }


        return allValid;
    }

     // Collecte les données de l'étape actuelle
     function collectStepData() {
         const currentStep = quizSteps[currentStepIndex];
         if (!currentStep) return {};

         // Récupérer tous les éléments de formulaire nommés dans l'étape actuelle
         const inputs = currentStep.querySelectorAll('input, select, textarea');
         const stepData = {};

         inputs.forEach(input => {
             const name = input.name;
             if (!name) return; // Ignore les champs sans nom

             if (input.type === 'radio') {
                 // Pour les radios, on ne prend que la valeur du radio coché dans le groupe
                 if (input.checked) {
                     stepData[name] = input.value;
                 }
             } else if (input.type === 'checkbox') {
                  // Pour les checkboxes, on peut stocker un booléen ou un tableau si plusieurs ont le même nom
                  // Ici, supposons une seule checkbox par nom pour l'exemple, ou stocker true/false
                  stepData[name] = input.checked;
             }
              else if (input.tagName === 'SELECT') {
                  // Pour les selects, on prend la valeur sélectionnée
                  stepData[name] = input.value;
              }
             else {
                 // Pour les champs texte, email, password, etc.
                 stepData[name] = input.value.trim();
             }
         });

         // Fusionne les nouvelles données avec les réponses déjà collectées
         quizResponses = { ...quizResponses, ...stepData };
         console.log("Données de l'étape", currentStepIndex + 1, ":", stepData);
         console.log("Données complètes collectées jusqu'à présent :", quizResponses);
     }


    // Gère le passage à l'étape suivante
    function handleNextStep() {
        console.log("handleNextStep appelé. currentStepIndex:", currentStepIndex); // <-- Ajouter cette ligne
        // 1. Valider l'étape actuelle
        if (!validateCurrentStep()) {
            console.log("Validation de l'étape échouée."); // <-- Ajouter cette ligne
            showToast("Veuillez remplir correctement tous les champs requis de cette étape.", 'warning');
            return; // Arrête si la validation échoue
        }
    console.log("Validation de l'étape réussie. Collecte des données..."); // <-- Ajouter cette ligne

        // 2. Collecter les données de l'étape actuelle (si c'est une étape de question)
        if (currentStepIndex < totalQuestionSteps) {
             collectStepData();
        }


        // 3. Passer à l'étape suivante (si pas la dernière question)
       if (currentStepIndex < totalQuestionSteps -1) {
            console.log("Passage à l'étape suivante. currentStepIndex avant increment:", currentStepIndex); // <-- Ajouter cette ligne
            currentStepIndex++;
            console.log("currentStepIndex après increment:", currentStepIndex); // <-- Ajouter cette ligne
            updateQuizUI();
            console.log("updateQuizUI appelé."); // <-- Ajouter cette ligne

        } else if (currentStepIndex === totalQuestionSteps - 1) {
             // On est à la dernière étape de question (étape 4).
             // Le bouton "Suivant" est caché et le bouton "Terminer" est affiché.
             // Le clic sur "Terminer" est géré par le listener du formulaire submit.
             // Ce bloc ne devrait normalement pas être atteint si les boutons sont gérés correctement par updateQuizUI
             // Mais par sécurité :
             console.warn("Le bouton 'Suivant' a été cliqué sur la dernière étape de question. Le bouton 'Terminer' devrait être visible à la place.");
        }

    }

    // Gère le retour à l'étape précédente
    function handlePrevStep() {
        // Collecter les données de l'étape actuelle (pour les conserver si l'utilisateur revient plus tard)
         if (currentStepIndex < totalQuestionSteps) {
             collectStepData(); // Optionnel : collecter avant de revenir si les réponses peuvent changer en revenant
         }

        // Revenir à l'étape précédente (si pas la première)
        if (currentStepIndex > 0) {
            currentStepIndex--;
            updateQuizUI();
        }
         // Pas besoin de gérer le cas currentStepIndex === 0 car le bouton Précédent est caché.
    }

    // Gère la soumission finale du formulaire (clic sur le bouton "Terminer")
    function handleFormSubmit(event) {
        event.preventDefault(); // Empêche le rechargement de la page

        // 1. Valider la dernière étape (étape 4)
        if (!validateCurrentStep()) {
            showToast("Veuillez remplir correctement tous les champs requis de cette étape pour terminer.", 'warning');
            return; // Arrête si la validation échoue
        }

        // 2. Collecter les données de la dernière étape
        collectStepData();

        // 3. Simuler le traitement des données (sauvegarde, création de compte)
        console.log("Quiz terminé. Données collectées :", quizResponses);

        // Ici, vous intégreriez la logique réelle :
        // - Envoyer quizResponses au serveur pour sauvegarde/analyse
        // - Créer le compte utilisateur avec email/mot de passe
        // - Stocker les données dans le profil utilisateur

        // Pour la démo : Simuler la réussite
         showToast("Votre évaluation est terminée ! Redirection...", 'success');

         // 4. Marquer l'Étape 0 (Évaluation) comme complétée dans le parcours
         // Appelle la fonction définie dans initParcoursPage pour mettre à jour la progression
         // Cette fonction DOIT être accessible globalement (ou gérée différemment, comme via un CustomEvent)
         // Pour la démo, on suppose qu'elle est sur window.
         if (typeof window.completeCurrentParcoursStep === 'function') {
              console.log("Appel de completeCurrentParcoursStep pour marquer l'Étape 0...");
              window.completeCurrentParcoursStep(); // Ceci devrait incrémenter et sauvegarder la progression
         } else {
              console.warn("La fonction window.completeCurrentParcoursStep n'est pas trouvée. Impossible de marquer l'étape 0 comme complétée.");
              // Stocker localement si la fonction n'existe pas (moins fiable)
              let etapesCompletes = parseInt(localStorage.getItem('emploiavenir_parcours_etapesCompletes') || '0', 10);
              if (etapesCompletes < 1) { // S'assurer que l'étape 0 est bien marquée complète (index 0 -> complétée)
                  localStorage.setItem('emploiavenir_parcours_etapesCompletes', '1');
                   localStorage.setItem('emploiavenir_parcours_lastActivityDate', new Date().toISOString().split('T')[0]);
                  console.log("Étape 0 marquée comme complétée via localStorage direct.");
              }
         }


        // 5. Passer à l'étape finale (message de fin)
        currentStepIndex = totalQuestionSteps; // Index après la dernière question
        updateQuizUI(); // Affiche l'étape 5

        // Optionnel : Redirection automatique après un court délai au lieu d'attendre le clic sur le bouton final
        // setTimeout(() => {
        //     window.location.href = 'MonParcours.html'; // Redirige vers la page Mon Parcours
        // }, 2000); // Redirige après 2 secondes
    }

    // Gère le clic sur le bouton "Accéder à mon parcours" (dans l'étape finale)
    function handleGoToParcours() {
         window.location.href = 'MonParcours.html'; // Redirige vers la page Mon Parcours
    }

    // --- Ajout des écouteurs d'événements ---

    // Boutons Précédent et Suivant
    prevStepButton.addEventListener('click', handlePrevStep);
    nextStepButton.addEventListener('click', handleNextStep);

    // Soumission du formulaire (bouton Terminer)
    evaluationForm.addEventListener('submit', handleFormSubmit);

     // Bouton "Accéder à mon parcours" (dans l'étape finale)
     goToParcoursButton.addEventListener('click', handleGoToParcours);

    // --- Initialisation ---
    updateQuizUI(); // Affiche la première étape au chargement de la page

    // Optionnel: Gérer la navigation par clavier (touches fléchées?) - Complexifie un peu
    // document.addEventListener('keydown', (event) => {
    //     if (event.key === 'ArrowRight' && nextStepButton.style.display !== 'none') {
    //         handleNextStep();
    //     } else if (event.key === 'ArrowLeft' && prevStepButton.style.visibility !== 'hidden') {
    //         handlePrevStep();
    //     }
    // });

} // Fin de initEvaluationPage

// ... (le reste du code script.js, y compris le DOMContentLoaded qui appelle toutes les fonctions init) ...

// Assurez-vous que votre bloc DOMContentLoaded à la fin de script.js appelle bien initEvaluationPage
/*
document.addEventListener('DOMContentLoaded', () => {
    // ... autres appels initPage ...
    initEvaluationPage(); // <-- Ajoutez ou assurez-vous que cet appel est présent
});
*/

    // --- Point d'entrée : Appeler les fonctions d'initialisation ---
    // Ces fonctions ne s'exécuteront que si les éléments DOM de la page correspondante existent.
    initParcoursPage();
    initDocumentsPage();
    initCandidaturesPage();
    initProfilPage();
    initPartenairesPage();
    initEvaluationPage();

}); // Fin de DOMContentLoaded