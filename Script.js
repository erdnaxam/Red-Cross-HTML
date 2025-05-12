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

          if (field.name === 'phone' && !patterns.phone.test(field.value)) {
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

    // Gestion des modales
    document.querySelectorAll('[data-modal-open]').forEach(btn => {
      btn.addEventListener('click', () => Modals.open(btn.dataset.modalOpen));
    });

    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', Modals.close);
    });

    // Gestion des formulaires
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!FormValidation.validate(form)) return;

        try {
          // Exemple de soumission AJAX
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

// ==================== INITIALISATION ====================
document.addEventListener('DOMContentLoaded', App.init);