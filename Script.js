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

// ==================== GESTION SPÉCIFIQUE QUESTIONNAIRE ====================
document.addEventListener('DOMContentLoaded', () => {
    const questionnaireForm = document.getElementById('evaluationForm');
    if (!questionnaireForm) {
        return; // Pas sur la page du questionnaire
    }
    console.log("QUESTIONNAIRE: Initialisation...");

    const steps = Array.from(questionnaireForm.querySelectorAll('fieldset.quiz-step, div.quiz-step')); // Inclut les fieldsets et le div final
    const nextBtn = document.getElementById('nextStepButton');
    const prevBtn = document.getElementById('prevStepButton');
    const submitAccountBtn = document.getElementById('submitQuizButton'); // Renommé pour clarté
    const currentQuestionDisplay = document.getElementById('currentQuizQuestion');
    const totalQuestionDisplay = document.getElementById('totalQuizQuestions');

    // IDs des étapes spéciales
    const ACCOUNT_CREATION_STEP_ID = 'step-4'; // L'étape où l'on crée le compte
    const CONGRATS_STEP_ID = 'step-5';       // L'étape finale de félicitations

    if (steps.length === 0 || !nextBtn || !prevBtn || !submitAccountBtn) {
        console.warn("QUESTIONNAIRE: Éléments essentiels (étapes, boutons nav) manquants.");
        return;
    }

    // Calcul du nombre d'étapes "de questions" (avant l'étape de félicitations)
    // Cela inclut l'étape de création de compte comme une étape à "valider"
    const totalInteractiveSteps = steps.findIndex(step => step.id === CONGRATS_STEP_ID);
    if (totalInteractiveSteps === -1) {
        console.error("QUESTIONNAIRE: L'étape de félicitations avec l'ID '" + CONGRATS_STEP_ID + "' est introuvable!");
        return;
    }

    // Nombre d'étapes affichées à l'utilisateur (ex: "Question X sur Y")
    // C'est le nombre d'étapes avant celle de création de compte.
    // Si step-4 est la création de compte, les étapes de "questions" sont step-1, step-2, step-3 (indices 0, 1, 2)
    // donc, questionCountForDisplay = index de step-4
    const questionCountForDisplay = steps.findIndex(step => step.id === ACCOUNT_CREATION_STEP_ID);

    if (totalQuestionDisplay && questionCountForDisplay > 0) {
        totalQuestionDisplay.textContent = questionCountForDisplay.toString(); // Affiche "sur 3" si step-1,2,3 sont des questions
    } else if (totalQuestionDisplay) {
        totalQuestionDisplay.textContent = "N/A"; // Ou cacher l'élément
    }

    let currentStepIndex = 0;

    function showStep(index) {
        const currentStepId = steps[index]?.id;
        console.log(`QUESTIONNAIRE: Affichage étape ${index} (ID: ${currentStepId})`);

        steps.forEach((step, i) => {
            step.style.display = i === index ? 'block' : 'none';
            step.classList.toggle('active-quiz-step', i === index); // Assurez-vous que cette classe est utile ou retirez-la
        });

        // Gestion des boutons de navigation principaux (Précédent, Suivant, Terminer/Créer Compte)
        prevBtn.style.visibility = (index === 0 || currentStepId === CONGRATS_STEP_ID) ? 'hidden' : 'visible';
        prevBtn.disabled = (index === 0 || currentStepId === CONGRATS_STEP_ID);

        if (currentStepId === ACCOUNT_CREATION_STEP_ID) { // Étape de création de compte
            nextBtn.style.display = 'none';
            submitAccountBtn.style.display = 'inline-block';
            submitAccountBtn.textContent = 'Créer mon compte et Terminer';
        } else if (currentStepId === CONGRATS_STEP_ID) { // Étape de félicitations
            nextBtn.style.display = 'none';
            submitAccountBtn.style.display = 'none';
            // Les boutons spécifiques à cette étape ("Retour à Mon Parcours", "Poursuivre") sont gérés séparément.
        } else { // Étapes de questions "normales"
            nextBtn.style.display = 'inline-block';
            submitAccountBtn.style.display = 'none';
            nextBtn.textContent = 'Suivant →';
        }

        // Mise à jour du compteur "Question X sur Y"
        if (currentQuestionDisplay && index < questionCountForDisplay) { // Si index < 3 (pour steps 1,2,3)
            currentQuestionDisplay.textContent = (index + 1).toString();
        } else if (currentQuestionDisplay && currentStepId === ACCOUNT_CREATION_STEP_ID) {
             currentQuestionDisplay.textContent = (questionCountForDisplay).toString(); // Affiche "3 sur 3" pour création compte
        } else if (currentQuestionDisplay) {
            currentQuestionDisplay.textContent = "-"; // Ou vide pour l'étape félicitations
        }

        // Focus sur le premier élément interactif de l'étape
        const firstFocusableElement = steps[index].querySelector('input:not([type="hidden"]), select, textarea, button:not([disabled])');
        if (firstFocusableElement) {
            firstFocusableElement.focus();
        }
    }

    function validateStep(stepIndex) {
        const currentStepElement = steps[stepIndex];
        let isValid = true;
        // console.log(`QUESTIONNAIRE: Validation étape ${stepIndex} (ID: ${currentStepElement.id})`);

        // Nettoyer les erreurs précédentes pour cette étape
        currentStepElement.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        currentStepElement.querySelectorAll('.error-message-quiz').forEach(el => el.remove());

        currentStepElement.querySelectorAll('[required]').forEach(field => {
            let fieldIsValid = true;
            let errorMessageText = "Ce champ est requis.";
            const fieldParentGroup = field.closest('.form-group') || field.closest('fieldset[role="radiogroup"]');

            if (field.type === 'radio') {
                const groupName = field.name;
                if (!currentStepElement.querySelector(`[name="${groupName}"]:checked`)) {
                    fieldIsValid = false;
                    errorMessageText = "Veuillez faire une sélection.";
                    if (fieldParentGroup) fieldParentGroup.classList.add('input-error'); // Erreur sur le groupe
                } else {
                    if (fieldParentGroup) fieldParentGroup.classList.remove('input-error');
                }
            } else if (field.tagName.toLowerCase() === 'select' && (field.value === "" || field.value === null)) {
                fieldIsValid = false;
            } else if (field.type === 'email' && field.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) {
                fieldIsValid = false;
                errorMessageText = "Adresse e-mail invalide.";
            } else if (field.type === 'password' && field.id === "user-password" && field.value.length < 6) {
                 fieldIsValid = false;
                 errorMessageText = "Le mot de passe doit contenir au moins 6 caractères.";
            } else if (field.type === 'password' && field.id === "confirm-password") {
                const mainPasswordField = questionnaireForm.querySelector('#user-password');
                if (!mainPasswordField || field.value !== mainPasswordField.value) { // Vérifier si mainPasswordField existe
                    fieldIsValid = false;
                    errorMessageText = "Les mots de passe ne correspondent pas.";
                } else if (field.value.length < 6) { // Vérifier aussi la longueur de la confirmation
                    fieldIsValid = false;
                    errorMessageText = "La confirmation doit aussi faire au moins 6 caractères.";
                }
            } else if (field.value.trim() === "" && field.tagName.toLowerCase() !== 'select' && field.type !== 'radio') {
                fieldIsValid = false;
            }

            if (!fieldIsValid) {
                isValid = false;
                // Appliquer la classe d'erreur au champ lui-même (sauf pour les radios)
                if (field.type !== 'radio' && fieldParentGroup) field.classList.add('input-error');
                else if (field.type !== 'radio') field.classList.add('input-error');


                const errorSpan = document.createElement('span');
                errorSpan.className = 'error-message error-message-quiz'; // Utiliser la classe 'error-message' du CSS général
                errorSpan.textContent = errorMessageText;
                // Insérer après le champ ou son groupe
                const targetForErrorMsg = fieldParentGroup || field.parentNode;
                // Insérer le message d'erreur après le champ lui-même ou à la fin du groupe
                if (fieldParentGroup && field.type === 'radio') { // Pour groupe de radio, à la fin du fieldset
                    fieldParentGroup.appendChild(errorSpan);
                } else if (field.nextSibling) {
                    field.parentNode.insertBefore(errorSpan, field.nextSibling);
                } else {
                    field.parentNode.appendChild(errorSpan);
                }
            }
        });

        if (!isValid) {
            if (typeof App !== 'undefined' && App.showToast) { // Vérifier si App.showToast est disponible
                App.showToast("Veuillez corriger les erreurs indiquées.", "warning");
            }
            console.warn("QUESTIONNAIRE: Validation échouée.");
        } else {
            // console.log("QUESTIONNAIRE: Validation réussie.");
        }
        return isValid;
    }

    // Afficher la première étape
    showStep(currentStepIndex);

    nextBtn.addEventListener('click', () => {
        if (validateStep(currentStepIndex)) {
            // Vérifier si l'étape suivante N'EST PAS l'étape de félicitations
            // totalInteractiveSteps est l'index de l'étape CONGRATS_STEP_ID
            if (currentStepIndex < totalInteractiveSteps -1) { // -1 car on compare à l'index de l'étape AVANT CONGRATS_STEP_ID
                currentStepIndex++;
                showStep(currentStepIndex);
            } else {
                 console.warn("QUESTIONNAIRE: nextBtn cliqué sur une étape où il devrait être masqué (probablement avant la création de compte).");
            }
        }
    });

    submitAccountBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (steps[currentStepIndex].id !== ACCOUNT_CREATION_STEP_ID) {
            console.warn("QUESTIONNAIRE: Tentative de soumission de compte sur une étape incorrecte.");
            return;
        }

        if (validateStep(currentStepIndex)) {
            console.log("QUESTIONNAIRE: Étape de création de compte validée, simulation de soumission...");
            // ICI: Mettre la logique AJAX pour envoyer les données du formulaire (new FormData(questionnaireForm))
            // et créer le compte sur le serveur.

            // Pour la démo, on simule un succès :
            if (typeof App !== 'undefined' && App.showToast) {
                App.showToast("Compte créé et évaluation sauvegardée !", "success");
            }
            // Passer à l'étape "Félicitations"
            const congratsStepIndex = steps.findIndex(step => step.id === CONGRATS_STEP_ID);
            if (congratsStepIndex !== -1) {
                currentStepIndex = congratsStepIndex;
                showStep(currentStepIndex);
            } else {
                console.error("QUESTIONNAIRE: Impossible de trouver l'étape de félicitations après soumission.");
            }
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStepIndex > 0 && steps[currentStepIndex].id !== CONGRATS_STEP_ID) {
            currentStepIndex--;
            showStep(currentStepIndex);
        }
    });

    // --- GESTION DES BOUTONS DE L'ÉTAPE "FÉLICITATIONS" ---
    const congratsStepElement = document.getElementById(CONGRATS_STEP_ID);
    if (congratsStepElement) {
        const backToParcoursBtnFinal = congratsStepElement.querySelector('#backToParcoursButton');
        const goToCVLMBtnFinal = congratsStepElement.querySelector('#goToCVLMButton'); // C'est un <a>

        const updateParcoursStatusAndRedirect = (redirectUrl) => {
            try {
                let parcoursData = JSON.parse(localStorage.getItem('parcoursEmploiAvenir')) || {};
                // S'assurer que la structure existe
                parcoursData.etapes = parcoursData.etapes || Array(8).fill(null).map((_, i) => ({ id: `etape-${i}`, statut: 'locked' }));
                parcoursData.etapeActuelleIndex = parcoursData.etapeActuelleIndex || 0;


                // Marquer l'étape 0 (Évaluation) comme complétée
                if (parcoursData.etapes[0]) {
                    parcoursData.etapes[0].statut = 'completed';
                    parcoursData.etapes[0].dateCompletion = new Date().toISOString();
                } else { // Fallback si la structure est corrompue/vide
                    parcoursData.etapes[0] = { id: 'etape-0', statut: 'completed', dateCompletion: new Date().toISOString() };
                }


                // Marquer l'étape 1 (CV & LM) comme active
                if (parcoursData.etapes[1]) {
                    parcoursData.etapes[1].statut = 'active';
                } else {
                    parcoursData.etapes[1] = { id: 'etape-1', statut: 'active' };
                }

                parcoursData.etapeActuelleIndex = 1; // L'étape CV & LM devient l'étape active
                parcoursData.derniereActivite = new Date().toISOString();

                localStorage.setItem('parcoursEmploiAvenir', JSON.stringify(parcoursData));
                console.log("QUESTIONNAIRE (Félicitations): Statut du parcours mis à jour.", parcoursData);

                if (redirectUrl) {
                    window.location.href = redirectUrl;
                }
            } catch (error) {
                console.error("QUESTIONNAIRE (Félicitations): Erreur lors de la mise à jour du statut:", error);
                if (typeof App !== 'undefined' && App.showToast) {
                    App.showToast("Erreur lors de la sauvegarde de la progression.", "error");
                }
                // On redirige quand même si une URL est fournie, pour ne pas bloquer l'utilisateur
                if (redirectUrl) {
                     setTimeout(() => window.location.href = redirectUrl, 500); // Petite pause pour voir le toast
                }
            }
        };

        if (backToParcoursBtnFinal) {
            backToParcoursBtnFinal.addEventListener('click', () => {
                console.log("QUESTIONNAIRE (Félicitations): Clic sur 'Retour à Mon Parcours'");
                updateParcoursStatusAndRedirect('MonParcours.html');
            });
        }

        if (goToCVLMBtnFinal) { // C'est un lien <a>
            goToCVLMBtnFinal.addEventListener('click', (e) => {
                // On empêche la redirection par défaut pour exécuter notre logique d'abord
                e.preventDefault();
                console.log("QUESTIONNAIRE (Félicitations): Clic sur 'Poursuivre mon parcours'");
                updateParcoursStatusAndRedirect(goToCVLMBtnFinal.href); // Utilise l'href du lien
            });
        }
    } else {
        console.warn(`QUESTIONNAIRE: L'étape de félicitations (ID: ${CONGRATS_STEP_ID}) ou ses boutons spécifiques n'ont pas été trouvés.`);
    }

    console.log("QUESTIONNAIRE: Fin de l'initialisation.");
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