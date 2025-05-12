/* script.js - Version optimisée pour EmploiAvenir */
'use strict';

// ==================== MODULES ====================
const App = (() => {
  // ---------- Configuration Globale ----------
  const DOM = {
    header: '#header',
    mobileMenuBtn: '#mobileMenuBtn',
    mainNavLinks: '#mainNavLinks',
    loginModal: '#loginModal',
    toastContainer: '#toast-container'
  };

  // ---------- État de l'Application ----------
  const state = {
    isMobileMenuOpen: false,
    currentPage: document.body.dataset.page || 'home'
  };

  // ---------- Utilitaire de Sécurité ----------
  const sanitizeInput = (value) => {
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
  };

  // ---------- Gestion des Erreurs ----------
  const handleError = (error, context) => {
    console.error(`[${context}]`, error);
    showToast(`Erreur: ${error.message}`, 'error');
  };

  // ---------- Module Toast ----------
  const Toast = (() => {
    const createToast = (message, type = 'info') => {
      const toast = document.createElement('div');
      toast.className = `toast toast-${type} animate__animated animate__fadeInUp`;
      toast.setAttribute('role', 'alert');
      toast.innerHTML = `
        <span class="toast-icon">${getToastIcon(type)}</span>
        <span class="toast-message">${message}</span>
      `;
      return toast;
    };

    const getToastIcon = (type) => {
      const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
      };
      return icons[type] || '';
    };

    return {
      show: (message, type) => {
        const container = document.querySelector(DOM.toastContainer);
        if (!container) return;

        const toast = createToast(message, type);
        container.appendChild(toast);

        setTimeout(() => {
          toast.classList.add('animate__fadeOut');
          setTimeout(() => toast.remove(), 500);
        }, 5000);
      }
    };
  })();

  // ---------- Module Navigation ----------
  const Navigation = (() => {
    const toggleMobileMenu = () => {
      const menu = document.querySelector(DOM.mainNavLinks);
      const button = document.querySelector(DOM.mobileMenuBtn);

      if (!menu || !button) return;

      state.isMobileMenuOpen = !state.isMobileMenuOpen;
      menu.classList.toggle('show-mobile');
      button.setAttribute('aria-expanded', state.isMobileMenuOpen);
      button.setAttribute('aria-label',
        state.isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu');
    };

    const closeMobileMenuOnResize = () => {
      if (window.innerWidth > 768 && state.isMobileMenuOpen) {
        toggleMobileMenu();
      }
    };

    return {
      init: () => {
        const menuButton = document.querySelector(DOM.mobileMenuBtn);
        if (menuButton) {
          menuButton.addEventListener('click', toggleMobileMenu);
        }

        window.addEventListener('resize', closeMobileMenuOnResize);
      }
    };
  })();

  // ---------- Module Modals ----------
  const Modals = (() => {
    let currentModal = null;

    const focusTrap = (e) => {
      if (e.key === 'Tab' && currentModal) {
        const focusable = currentModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    return {
      open: (modalId) => {
        currentModal = document.getElementById(modalId);
        if (!currentModal) return;

        currentModal.style.display = 'block';
        currentModal.setAttribute('aria-hidden', 'false');
        currentModal.querySelector('[autofocus]')?.focus();
        document.addEventListener('keydown', focusTrap);
      },

      close: () => {
        if (!currentModal) return;

        currentModal.style.display = 'none';
        currentModal.setAttribute('aria-hidden', 'true');
        document.removeEventListener('keydown', focusTrap);
        currentModal = null;
      }
    };
  })();

  // ---------- Module FormValidation ----------
  const FormValidation = (() => {
    const patterns = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/
    };

    const showFieldError = (field, message) => {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'form-error';
      errorDiv.id = `${field.id}-error`;
      errorDiv.textContent = message;
      errorDiv.setAttribute('role', 'alert');
      field.parentNode.insertBefore(errorDiv, field.nextSibling);
      field.classList.add('invalid');
    };

    return {
      validate: (form) => {
        let isValid = true;
        const fields = form.querySelectorAll('[required]');

        fields.forEach(field => {
          field.classList.remove('invalid');
          const error = form.querySelector(`#${field.id}-error`);
          if (error) error.remove();

          if (!field.value.trim()) {
            showFieldError(field, 'Ce champ est requis');
            isValid = false;
          }

          if (field.type === 'email' && !patterns.email.test(field.value)) {
            showFieldError(field, 'Email invalide');
            isValid = false;
          }

          if (field.name === 'phone' && field.value && !patterns.phone.test(field.value)) {
            showFieldError(field, 'Numéro invalide');
            isValid = false;
          }
        });

        return isValid;
      }
    };
  })();

  // ---------- Initialisation de l'Application ----------
  const init = () => {
    Navigation.init();

    document.querySelectorAll('[data-modal-open]').forEach(btn => {
      btn.addEventListener('click', () => Modals.open(btn.dataset.modalOpen));
    });

    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', Modals.close);
    });

    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!FormValidation.validate(form)) return;

        try {
          const response = await fetch(form.action, {
            method: 'POST',
            body: new FormData(form)
          });

          if (!response.ok) throw new Error('Échec de la soumission');

          Toast.show('Formulaire soumis avec succès', 'success');
          form.reset();
          Modals.close();
        } catch (error) {
          handleError(error, 'Form Submission');
        }
      });
    });
  };

  return {
    init,
    showToast: Toast.show
  };
})();

// Gestion du questionnaire
// ==================== GESTION SPÉCIFIQUE QUESTIONNAIRE ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log("QUESTIONNAIRE: Initialisation...");

    const questionnaireForm = document.getElementById('evaluationForm');
    if (!questionnaireForm) {
        // Si le formulaire principal n'est pas là, on n'est probablement pas sur la bonne page.
        // On peut retourner silencieusement ou afficher un log si on s'attend à ce qu'il soit là.
        // console.log("QUESTIONNAIRE: Formulaire 'evaluationForm' non trouvé. Arrêt.");
        return;
    }

    // Les étapes sont les fieldsets directs avec la classe .quiz-step
    const steps = Array.from(questionnaireForm.querySelectorAll('fieldset.quiz-step'));
    const nextBtn = document.getElementById('nextStepButton');
    const prevBtn = document.getElementById('prevStepButton');
    const submitBtn = document.getElementById('submitQuizButton'); // Bouton pour la soumission finale
    const currentQuestionDisplay = document.getElementById('currentQuizQuestion');
    const totalQuestionDisplay = document.getElementById('totalQuizQuestions');

    // Les "vraies" étapes de questions (excluant la dernière étape "Félicitations")
    const questionStepsCount = steps.findIndex(step => step.id === 'step-4'); // L'ID de l'étape "Félicitations"

    if (steps.length === 0 || !nextBtn || !prevBtn || !submitBtn) {
        console.warn("QUESTIONNAIRE: Éléments essentiels manquants. Vérifiez les IDs et classes.");
        if (steps.length === 0) console.log(" -> Aucune étape avec la classe '.quiz-step' trouvée DANS #evaluationForm.");
        if (!nextBtn) console.log(" -> Bouton #nextStepButton non trouvé.");
        if (!prevBtn) console.log(" -> Bouton #prevStepButton non trouvé.");
        if (!submitBtn) console.log(" -> Bouton #submitQuizButton non trouvé.");
        return;
    }
    console.log(`QUESTIONNAIRE: ${steps.length} étapes au total trouvées, ${questionStepsCount} étapes de questions.`);

    if (totalQuestionDisplay && questionStepsCount > 0) {
        totalQuestionDisplay.textContent = questionStepsCount.toString();
    }

    let currentStepIndex = 0;

    // Optionnel: Barre de progression (si tu en ajoutes une)
    // const progressBar = questionnaireForm.querySelector('.quiz-progress-bar-fill');
    // function updateProgressBar() { /* ... */ }

    function showStep(index) {
        console.log(`QUESTIONNAIRE: Affichage étape ${index} (ID: ${steps[index]?.id})`);
        steps.forEach((step, i) => {
            step.style.display = i === index ? 'block' : 'none';
            step.classList.toggle('active-quiz-step', i === index);
        });

        // Gestion des boutons
        prevBtn.style.visibility = index === 0 ? 'hidden' : 'visible';
        prevBtn.disabled = index === 0;

        // Si l'étape actuelle est l'avant-dernière (création de compte, step-3)
        if (index === questionStepsCount -1) { // -1 car questionStepsCount est le nombre, et l'index est 0-based
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'inline-block';
            submitBtn.textContent = 'Créer mon compte et Terminer';
        }
        // Si l'étape actuelle est la dernière (félicitations, step-4)
        else if (index === questionStepsCount) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'none';
            prevBtn.style.visibility = 'hidden'; // Pas de retour depuis l'étape finale
            prevBtn.disabled = true;
        }
        // Pour toutes les autres étapes "questions"
        else {
            nextBtn.style.display = 'inline-block';
            submitBtn.style.display = 'none';
            nextBtn.textContent = 'Suivant →';
        }


        if (currentQuestionDisplay && index < questionStepsCount) { // Ne pas afficher pour l'étape "Félicitations"
            currentQuestionDisplay.textContent = (index + 1).toString();
        }

        // updateProgressBar(); // Si tu as une barre de progression

        const firstFocusableElement = steps[index].querySelector('input:not([type="hidden"]), select, textarea, button');
        if (firstFocusableElement) {
            firstFocusableElement.focus();
        }
    }

    function validateStep(stepIndex) {
        const currentStepElement = steps[stepIndex];
        let isValid = true;
        console.log(`QUESTIONNAIRE: Validation étape ${stepIndex} (ID: ${currentStepElement.id})`);

        currentStepElement.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        currentStepElement.querySelectorAll('.error-message-quiz').forEach(el => el.remove());

        currentStepElement.querySelectorAll('[required]').forEach(field => {
            let fieldIsValid = true;
            let errorMessage = "Ce champ est requis.";

            const fieldParentGroup = field.closest('.form-group') || field.closest('fieldset[role="radiogroup"]');

            if (field.type === 'radio') {
                const groupName = field.name;
                if (!currentStepElement.querySelector(`[name="${groupName}"]:checked`)) {
                    fieldIsValid = false;
                    if (fieldParentGroup) fieldParentGroup.classList.add('input-error');
                    errorMessage = "Veuillez faire une sélection.";
                } else {
                    if (fieldParentGroup) fieldParentGroup.classList.remove('input-error');
                }
            } else if (field.tagName.toLowerCase() === 'select' && (field.value === "" || field.value === null)) {
                fieldIsValid = false;
            } else if (field.type === 'email' && field.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) {
                fieldIsValid = false;
                errorMessage = "Adresse e-mail invalide.";
            } else if (field.type === 'password' && field.name === "userPassword" && field.value.length < 6) {
                 fieldIsValid = false;
                 errorMessage = "Le mot de passe doit contenir au moins 6 caractères.";
            } else if (field.type === 'password' && field.name === "confirmPassword") {
                const mainPasswordField = questionnaireForm.querySelector('#user-password');
                if (mainPasswordField && field.value !== mainPasswordField.value) {
                    fieldIsValid = false;
                    errorMessage = "Les mots de passe ne correspondent pas.";
                } else if (field.value.length < 6) {
                    fieldIsValid = false;
                    errorMessage = "La confirmation doit aussi faire au moins 6 caractères.";
                }
            } else if (field.value.trim() === "" && field.tagName.toLowerCase() !== 'select') { // Pour inputs text, textarea
                fieldIsValid = false;
            }


            if (!fieldIsValid) {
                isValid = false;
                if (fieldParentGroup && field.type !== 'radio') { // Ne pas ajouter sur chaque radio individuel mais sur son groupe
                    field.classList.add('input-error');
                } else if (field.type !== 'radio') { // Pour les champs sans .form-group
                    field.classList.add('input-error');
                }


                const errorSpan = document.createElement('span');
                errorSpan.className = 'error-message-quiz';
                errorSpan.textContent = errorMessage;
                // Insérer après le champ ou son conteneur (ex: pour les radios, après le fieldset)
                const targetForError = fieldParentGroup || field.parentNode;
                targetForError.appendChild(errorSpan); // Ou insérer après le dernier enfant du groupe
            }
        });

        if (!isValid) {
            App.showToast("Veuillez corriger les erreurs indiquées.", "warning");
            console.warn("QUESTIONNAIRE: Validation échouée.");
        } else {
            console.log("QUESTIONNAIRE: Validation réussie.");
        }
        return isValid;
    }

    showStep(currentStepIndex);

    nextBtn.addEventListener('click', () => {
        console.log("QUESTIONNAIRE: Clic sur Suivant");
        if (validateStep(currentStepIndex)) {
            if (currentStepIndex < questionStepsCount -1) { // S'arrêter avant l'étape de création de compte
                currentStepIndex++;
                showStep(currentStepIndex);
            } else {
                 // Normalement, ne devrait pas être atteint si la logique de showStep cache bien nextBtn
                 console.warn("QUESTIONNAIRE: nextBtn cliqué sur une étape où il devrait être masqué.");
            }
        }
    });

    submitBtn.addEventListener('click', (e) => { // Le bouton submit a son propre listener
        e.preventDefault(); // Empêcher la soumission HTML par défaut
        console.log("QUESTIONNAIRE: Clic sur Terminer/Créer Compte");
        if (validateStep(currentStepIndex)) { // Valider l'étape actuelle (création de compte)
            console.log("QUESTIONNAIRE: Étape de création de compte validée, soumission...");

            // Logique de soumission du formulaire (peut être AJAX)
            // Pour l'instant, on simule et on passe à l'étape "Félicitations"
            // Ici, tu ferais ton appel fetch pour créer le compte

            // Simulation d'une soumission réussie
            App.showToast("Compte créé et évaluation sauvegardée !", "success");
            currentStepIndex++; // Passer à l'étape "Félicitations"
            showStep(currentStepIndex);
        }
    });


    prevBtn.addEventListener('click', () => {
        console.log("QUESTIONNAIRE: Clic sur Précédent");
        if (currentStepIndex > 0) {
            currentStepIndex--;
            showStep(currentStepIndex);
        }
    });

    // Gestion des boutons sur la dernière page "Félicitations"
    const goToParcoursButton = document.getElementById('goToParcoursButton');
    const goToCVLMButton = document.getElementById('goToCVLMButton');

    if (goToParcoursButton) {
        goToParcoursButton.addEventListener('click', () => {
            // Rediriger vers la page Mon Parcours
            window.location.href = 'MonParcours.html'; // Adapte le nom du fichier si besoin
        });
    }
    if (goToCVLMButton) {
         goToCVLMButton.addEventListener('click', (e) => { // Pour un lien, on peut laisser le comportement par défaut ou gérer via JS
            // window.location.href = e.target.href; // Inutile si c'est un lien <a>
            console.log("Redirection vers CV/LM...");
        });
    }


    console.log("QUESTIONNAIRE: Gestionnaire d'événements initialisé.");
});
// Gestion du générateur de CV
document.addEventListener('DOMContentLoaded', () => {
  const steps = document.querySelectorAll('.cv-step');
  const nextBtn = document.getElementById('nextStepBtn');
  const prevBtn = document.getElementById('prevStepBtn');
  const preview = document.getElementById('final-preview-content');
  const form = document.getElementById('cvAssistantForm');

  if (steps.length && nextBtn && prevBtn) {
    let currentStep = 0;

    function showStep(index) {
      steps.forEach((step, i) => {
        step.style.display = i === index ? 'block' : 'none';
        step.classList.toggle('active-step', i === index);
      });

      prevBtn.disabled = index === 0;
      nextBtn.style.display = index < steps.length - 1 ? 'inline-block' : 'none';

      if (index === steps.length - 1) updatePreview();
    }

    function validateStep(stepIndex) {
      let valid = true;
      const fields = steps[stepIndex].querySelectorAll('[required]');

      fields.forEach(field => {
        field.classList.remove('input-error');
        if (field.type === 'email' && !field.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          valid = false;
          field.classList.add('input-error');
        } else if (!field.value.trim()) {
          valid = false;
          field.classList.add('input-error');
        }
      });

      return valid;
    }

    function updatePreview() {
      if (!preview || !form) return;

      const formData = new FormData(form);
      const experiences = [];
      const formations = [];
      const competences = [];
      const langues = [];

      // Récupération des données
      document.querySelectorAll('[name="experience_title[]"]').forEach((field, index) => {
        experiences.push({
          titre: field.value,
          entreprise: document.querySelectorAll('[name="experience_company[]"]')[index]?.value,
          dates: document.querySelectorAll('[name="experience_dates[]"]')[index]?.value,
          description: document.querySelectorAll('[name="experience_desc[]"]')[index]?.value
        });
      });

      document.querySelectorAll('[name="formation_title[]"]').forEach((field, index) => {
        formations.push({
          diplome: field.value,
          ecole: document.querySelectorAll('[name="formation_school[]"]')[index]?.value,
          dates: document.querySelectorAll('[name="formation_dates[]"]')[index]?.value
        });
      });

      document.querySelectorAll('[name="competence[]"]').forEach(field => {
        if (field.value.trim()) competences.push(field.value);
      });

      document.querySelectorAll('[name="langue[]"]').forEach(field => {
        if (field.value.trim()) langues.push(field.value);
      });

      // Construction de l'aperçu
      preview.innerHTML = `
        <div class="cv-preview">
          <h1>${formData.get('name') || ''}</h1>
          <h2>${formData.get('cvTitleInput') || ''}</h2>

          <section class="cv-section">
            <h3>Coordonnées</h3>
            <p>📧 ${formData.get('email') || ''}</p>
            <p>📱 ${formData.get('phone') || ''}</p>
            <p>📍 ${formData.get('address') || ''}</p>
          </section>

          ${buildSection('Expériences', experiences, exp => `
            <h4>${exp.titre}</h4>
            <p>${exp.entreprise} ${exp.dates ? '• ' + exp.dates : ''}</p>
            ${exp.description ? `<p>${exp.description}</p>` : ''}
          `)}

          ${buildSection('Formations', formations, form => `
            <h4>${form.diplome}</h4>
            <p>${form.ecole} ${form.dates ? '• ' + form.dates : ''}</p>
          `)}

          ${buildListSection('Compétences', competences)}
          ${buildListSection('Langues', langues)}
        </div>
      `;
    }

    function buildSection(title, items, template) {
      return items.length > 0 ? `
        <section class="cv-section">
          <h3>${title}</h3>
          ${items.map(item => `<div class="cv-item">${template(item)}</div>`).join('')}
        </section>` : '';
    }

    function buildListSection(title, items) {
      return items.length > 0 ? `
        <section class="cv-section">
          <h3>${title}</h3>
          <ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>
        </section>` : '';
    }

    showStep(currentStep);

    nextBtn.addEventListener('click', () => {
      if (validateStep(currentStep)) {
        currentStep++;
        showStep(currentStep);
      }
    });

    prevBtn.addEventListener('click', () => {
      if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
      }
    });

    if (form) form.addEventListener('input', updatePreview);
  }
});

// Gestion des champs dynamiques
document.addEventListener('DOMContentLoaded', () => {
  // Expériences
  const addExpBtn = document.getElementById('addExperienceFormBtn');
  const expList = document.getElementById('experiences-list-form');

  if (addExpBtn && expList) {
    addExpBtn.replaceWith(addExpBtn.cloneNode(true));
    const newAddExpBtn = document.getElementById('addExperienceFormBtn');

    function createExperience() {
      const wrapper = document.createElement('div');
      wrapper.className = 'experience-form-item card mb-4';
      wrapper.innerHTML = `
        <div class="form-group">
          <label>Intitulé du poste <span aria-hidden="true">*</span></label>
          <input type="text" name="experience_title[]" required>
        </div>
        <div class="form-group">
          <label>Entreprise <span aria-hidden="true">*</span></label>
          <input type="text" name="experience_company[]" required>
        </div>
        <div class="form-group">
          <label>Dates</label>
          <input type="text" name="experience_dates[]">
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea name="experience_desc[]" rows="2"></textarea>
        </div>
        <button type="button" class="btn btn-danger remove-experience-btn">Supprimer</button>
      `;
      wrapper.querySelector('.remove-experience-btn').addEventListener('click', () => wrapper.remove());
      return wrapper;
    }

    newAddExpBtn.addEventListener('click', () => expList.appendChild(createExperience()));
  }

  // Formations
  const addFormationBtn = document.getElementById('addFormationFormBtn');
  const formationList = document.getElementById('formations-list-form');

  if (addFormationBtn && formationList) {
    addFormationBtn.replaceWith(addFormationBtn.cloneNode(true));
    const newAddFormationBtn = document.getElementById('addFormationFormBtn');

    function createFormation() {
      const wrapper = document.createElement('div');
      wrapper.className = 'formation-form-item card mb-4';
      wrapper.innerHTML = `
        <div class="form-group">
          <label>Diplôme <span aria-hidden="true">*</span></label>
          <input type="text" name="formation_title[]" required>
        </div>
        <div class="form-group">
          <label>École <span aria-hidden="true">*</span></label>
          <input type="text" name="formation_school[]" required>
        </div>
        <div class="form-group">
          <label>Dates</label>
          <input type="text" name="formation_dates[]">
        </div>
        <button type="button" class="btn btn-danger remove-formation-btn">Supprimer</button>
      `;
      wrapper.querySelector('.remove-formation-btn').addEventListener('click', () => wrapper.remove());
      return wrapper;
    }

    newAddFormationBtn.addEventListener('click', () => formationList.appendChild(createFormation()));
  }

  // Compétences
  const addCompetenceBtn = document.getElementById('addCompetenceToListBtn');
  const competenceInput = document.getElementById('newCompetenceInput');
  const competenceList = document.getElementById('competences-list-form');

  if (addCompetenceBtn && competenceInput && competenceList) {
    addCompetenceBtn.replaceWith(addCompetenceBtn.cloneNode(true));
    const newAddCompetenceBtn = document.getElementById('addCompetenceToListBtn');

    newAddCompetenceBtn.addEventListener('click', () => {
      const value = competenceInput.value.trim();
      if (value) {
        const item = document.createElement('div');
        item.className = 'competence-item';
        item.innerHTML = `
          <input type="hidden" name="competence[]" value="${value}">
          <span>${value}</span>
          <button type="button" class="btn btn-danger btn-sm remove-competence-btn">×</button>
        `;
        item.querySelector('.remove-competence-btn').addEventListener('click', () => item.remove());
        competenceList.appendChild(item);
        competenceInput.value = '';
      }
    });
  }

  // Langues
  const addLangueBtn = document.getElementById('addLangueToListBtn');
  const langueInput = document.getElementById('newLangueInput');
  const niveauSelect = document.getElementById('newLangueLevelSelect');
  const langueList = document.getElementById('langues-list-form');

  if (addLangueBtn && langueInput && niveauSelect && langueList) {
    addLangueBtn.replaceWith(addLangueBtn.cloneNode(true));
    const newAddLangueBtn = document.getElementById('addLangueToListBtn');

    newAddLangueBtn.addEventListener('click', () => {
      const langue = langueInput.value.trim();
      const niveau = niveauSelect.value;
      if (langue && niveau) {
        const item = document.createElement('div');
        item.className = 'langue-item';
        item.innerHTML = `
          <input type="hidden" name="langue[]" value="${langue} (${niveau})">
          <span>${langue} (${niveau})</span>
          <button type="button" class="btn btn-danger btn-sm remove-langue-btn">×</button>
        `;
        item.querySelector('.remove-langue-btn').addEventListener('click', () => item.remove());
        langueList.appendChild(item);
        langueInput.value = '';
        niveauSelect.value = '';
      }
    });
  }
});
document.addEventListener('DOMContentLoaded', () => {

    // --- Éléments Clés ---
    const cvForm = document.getElementById('cvAssistantForm');
    const previewContainer = document.getElementById('final-preview-content');
    const downloadBtn = document.getElementById('downloadPdfBtn');
    const goToLettreMotivationBtn = document.getElementById('goToLettreMotivationBtn'); // NOUVEAU : Récupérer le bouton/lien

    // --- Vérification Initiale ---
    if (!cvForm || !previewContainer || !downloadBtn) {
        console.error("Erreur: Un ou plusieurs éléments essentiels (formulaire, aperçu, bouton) sont manquants.");
        return; // Arrêter si les éléments de base ne sont pas là
    }

    // --- Fonctions Utilitaires pour construire l'HTML de l'aperçu ---
    // (Ces fonctions sont reprises de ton script original)
    function buildSection(title, items, template) {
      return items.length > 0 ? `
        <section class="cv-section">
          <h3>${title}</h3>
          ${items.map(item => `<div class="cv-item">${template(item)}</div>`).join('')}
        </section>` : '';
    }

    function buildListSection(title, items) {
      return items.length > 0 ? `
        <section class="cv-section">
          <h3>${title}</h3>
          <ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>
        </section>` : '';
    }

    // --- Fonction Principale pour Mettre à Jour l'Aperçu ---
    function updateFinalPreview() {
        console.log("Mise à jour de l'aperçu demandée."); // Log
        const formData = new FormData(cvForm);
        const experiences = [];
        const formations = [];
        const competences = [];
        const langues = [];

        // Récupération Expériences (depuis les champs du formulaire)
        document.querySelectorAll('#experiences-list-form .experience-form-item').forEach(item => {
            experiences.push({
                titre: item.querySelector('[name="experience_title[]"]')?.value || '',
                entreprise: item.querySelector('[name="experience_company[]"]')?.value || '',
                dates: item.querySelector('[name="experience_dates[]"]')?.value || '',
                description: item.querySelector('[name="experience_desc[]"]')?.value || ''
            });
        });

        // Récupération Formations
        document.querySelectorAll('#formations-list-form .formation-form-item').forEach(item => {
            formations.push({
                diplome: item.querySelector('[name="formation_title[]"]')?.value || '',
                ecole: item.querySelector('[name="formation_school[]"]')?.value || '',
                dates: item.querySelector('[name="formation_dates[]"]')?.value || ''
            });
        });

        // Récupération Compétences
        document.querySelectorAll('#competences-list-form .competence-item input[name="competence[]"]').forEach(input => {
             if (input.value.trim()) competences.push(input.value);
        });

        // Récupération Langues
        document.querySelectorAll('#langues-list-form .langue-item input[name="langue[]"]').forEach(input => {
            if (input.value.trim()) langues.push(input.value);
        });

        // Construction de l'HTML pour l'aperçu
        const name = formData.get('name') || '';
        const cvTitle = formData.get('cvTitleInput') || ''; // Vérifie le 'name' de l'input titre CV
        const email = formData.get('email') || '';
        const phone = formData.get('phone') || '';
        const address = formData.get('address') || '';

        // On insère l'HTML dans le conteneur d'aperçu
        // Utilise les classes .cv-preview-* définies dans ton CSS pour le style PDF
        previewContainer.innerHTML = `
            <div class="cv-preview-header">
              ${name ? `<h2>${name}</h2>` : ''}
              ${cvTitle ? `<p class="cv-preview-jobtitle">${cvTitle}</p>` : ''}
            </div>
            ${(email || phone || address) ? `
            <section class="contact-info-preview cv-section">
              ${email ? `<p><i class="fas fa-envelope"></i> ${email}</p>` : ''}
              ${phone ? `<p><i class="fas fa-phone"></i> ${phone}</p>` : ''}
              ${address ? `<p><i class="fas fa-map-marker-alt"></i> ${address}</p>` : ''}
            </section>` : ''}

            ${buildSection('Expériences Professionnelles', experiences, exp => `
              <div class="experience-preview-item">
                <h4>${exp.titre}</h4>
                <p class="organisation">${exp.entreprise}</p>
                ${exp.dates ? `<p class="dates-preview">${exp.dates}</p>` : ''}
                ${exp.description ? `<p class="description-preview">${exp.description}</p>` : ''}
              </div>
            `)}

            ${buildSection('Formations', formations, form => `
              <div class="formation-preview-item">
                <h4>${form.diplome}</h4>
                <p class="organisation">${form.ecole}</p>
                ${form.dates ? `<p class="dates-preview">${form.dates}</p>` : ''}
              </div>
            `)}

            ${buildListSection('Compétences', competences)}
            ${buildListSection('Langues', langues)}
        `;
         console.log("Contenu de l'aperçu mis à jour dans le DOM."); // Log
    }

    // --- Écouteur pour le Bouton Télécharger ---
    downloadBtn.addEventListener('click', async () => {
        console.log("Clic sur Télécharger PDF.");
        // 1. S'assurer que l'aperçu est à jour
        updateFinalPreview();

        // 2. Attendre que le navigateur ait rendu les changements (plus fiable)
        console.log("Attente du rendu du navigateur...");
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        console.log("Rendu terminé (supposément).");

        // 3. Vérifier si l'élément d'aperçu est prêt
        if (!previewContainer.innerHTML.trim() || previewContainer.offsetHeight === 0) {
            console.error("Erreur PDF: Le conteneur d'aperçu est vide ou invisible.");
            alert("Impossible de générer le PDF : l'aperçu semble vide. Veuillez remplir quelques informations.");
            return;
        }
         console.log("Conteneur d'aperçu prêt pour la capture.");

        // 4. Options pour html2pdf
        const pdfOptions = {
            margin:       0, // Marges gérées par le padding de .cv-preview-area
            filename:     'Mon-CV-EmploiAvenir.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  {
                scale: 2, // Bonne résolution
                useCORS: true, // Si des images externes sont utilisées un jour
                logging: true, // Utile pour le débogage
                backgroundColor: '#ffffff', // Fond blanc explicite
                // Forcer la capture de la taille A4 si nécessaire (peut aider)
                // windowWidth: 794,
                // windowHeight: 1123
            },
            jsPDF:        { unit: 'pt', format: 'a4', orientation: 'portrait' }
        };

        console.log("Options PDF:", pdfOptions);
        console.log("Début de la génération PDF...");

        // 5. Générer et sauvegarder le PDF
        try {
            await html2pdf().set(pdfOptions).from(previewContainer).save();
            console.log("PDF généré avec succès.");
            // AFFICHER LE BOUTON/LIEN POUR LA LETTRE DE MOTIVATION
            goToLettreMotivationBtn.style.display = 'inline-flex'; // ou 'block' / 'inline-block'
        } catch (error) {
            console.error("Erreur lors de la génération PDF avec html2pdf:", error);
            alert(`Une erreur technique est survenue lors de la création du PDF: ${error.message}`);
        }
    });

    // --- Écouteur pour mettre à jour l'aperçu en direct pendant la saisie ---
    cvForm.addEventListener('input', updateFinalPreview);

    // --- Gestion des Champs Dynamiques (simplifiée) ---
    // Assure-toi que les fonctions createExperience, createFormation etc.
    // attachent bien les écouteurs aux boutons "Supprimer" ET que
    // ces écouteurs appellent updateFinalPreview() après la suppression.

    // Exemple pour Expériences (Adapte pour les autres sections)
    const addExpBtn = document.getElementById('addExperienceFormBtn');
    const expList = document.getElementById('experiences-list-form');

    if (addExpBtn && expList) {
        function createExperienceElement() {
            const wrapper = document.createElement('div');
            wrapper.className = 'experience-form-item card mb-4'; // Utilise tes classes existantes
            wrapper.innerHTML = `
              <div class="form-group">
                <label>Intitulé du poste*</label>
                <input type="text" name="experience_title[]" required class="form-control">
              </div>
              <div class="form-group">
                <label>Entreprise*</label>
                <input type="text" name="experience_company[]" required class="form-control">
              </div>
              <div class="form-group">
                <label>Dates</label>
                <input type="text" name="experience_dates[]" class="form-control" placeholder="Ex: 2022 - 2023">
              </div>
              <div class="form-group">
                <label>Description (facultatif)</label>
                <textarea name="experience_desc[]" rows="3" class="form-control"></textarea>
              </div>
              <button type="button" class="btn btn-small btn-outline remove-item-btn">Supprimer</button>
            `;
            // Écouteur pour le bouton supprimer de CET élément
            wrapper.querySelector('.remove-item-btn').addEventListener('click', () => {
                wrapper.remove(); // Supprime l'élément du DOM
                updateFinalPreview(); // Met à jour l'aperçu après suppression
            });
            return wrapper;
        }

        addExpBtn.addEventListener('click', () => {
            expList.appendChild(createExperienceElement());
            // Pas besoin d'appeler updateFinalPreview ici, car l'event 'input' sur le formulaire le fera
            // si l'utilisateur commence à taper dans les nouveaux champs.
        });

        // Ajouter des écouteurs aux boutons supprimer déjà présents au chargement

        expList.querySelectorAll('.remove-item-btn').forEach(button => {
             button.addEventListener('click', (e) => {
                e.target.closest('.experience-form-item').remove();
                updateFinalPreview();
            });
        });
    }
    // ... Répète une logique similaire pour Formations, Compétences, Langues ...
    // Assure-toi que la suppression appelle TOUJOURS updateFinalPreview()


    // --- Mise à jour initiale de l'aperçu au chargement (si des données existent déjà) ---
    updateFinalPreview();

}); // Fin de DOMContentLoaded
// Initialisation globale
document.addEventListener('DOMContentLoaded', App.init);
