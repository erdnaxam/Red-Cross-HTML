document.addEventListener('DOMContentLoaded', () => {

    // --- Données initiales (similaire à useState dans React) ---
    const partnersData = [
         {
            id: '1',
            name: 'France Travail',
            category: 'emploi',
            description: "L'organisme public pour l'emploi en France",
            services: ["Accompagnement personnalisé", "Offres d'emploi", "Ateliers de recherche"],
            address: '15 rue de Paris, 75001 Paris',
            phone: '3949',
            email: 'contact@francetravail.fr',
            website: 'https://www.francetravail.fr',
            logoUrl: 'Images/FranceTravail.webp' // Mettre un vrai chemin ou laisser vide
        },
        {
            id: '2',
            name: 'Croix-Rouge française',
            category: 'accompagnement',
            description: "Association d'aide humanitaire",
            services: ['Accompagnement social', 'Aide alimentaire', 'Insertion professionnelle'],
            address: '86 rue Didot, 75014 Paris',
            phone: '01 44 43 11 00',
            email: 'contact@croix-rouge.fr',
            website: 'https://www.croix-rouge.fr',
            logoUrl: 'Images/CroixRougeFR.png'
        },
        {
            id: '3',
            name: 'AFPA',
            category: 'formation',
            description: 'Centre de formation professionnelle pour adultes',
            services: ['Formation professionnelle', 'Certification', 'Reconversion'],
            address: '3 rue Franklin, 93100 Montreuil',
            phone: '3936',
            email: 'contact@afpa.fr',
            website: 'https://www.afpa.fr',
            logoUrl: 'Images/Afpa.png'
        },
        {
            id: '4',
            name: 'Mission Locale',
            category: 'insertion',
            description: 'Accompagnement des jeunes dans leur insertion professionnelle',
            services: ["Conseil en orientation", "Aide à la recherche d'emploi", 'Accompagnement social'],
            address: '34 rue Nationale, 75013 Paris',
            phone: '01 44 97 28 85',
            website: 'https://www.mission-locale.fr',
            logoUrl: 'Images/MissionLocale.png'
        }
    ];

    // Simule la récupération depuis localStorage ou une API si nécessaire
    let appointmentsData = JSON.parse(localStorage.getItem('appointments')) || [
        {
            id: 'rdv_init_1', // ID unique
            partnerId: '1',
            partnerName: 'France Travail',
            date: '2025-04-15',
            time: '14:30',
            type: 'présentiel',
            notes: 'Apporter CV et pièce d\'identité'
        }
    ];

    const categoryLabels = {
        'insertion': 'Insertion professionnelle',
        'emploi': "Recherche d'emploi",
        'formation': 'Formation',
        'accompagnement': 'Accompagnement social',
        'aide': 'Aide aux démarches'
    };

    // --- Références aux éléments du DOM ---
    const tabsList = document.querySelector('.tabs-list');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const searchQueryInput = document.getElementById('search-query');
    const categoryFilterSelect = document.getElementById('category-filter');
    const partnerListContainer = document.getElementById('partner-list');
    const noPartnersMessage = document.getElementById('no-partners-message');
    const appointmentForm = document.getElementById('appointment-form');
    const appointmentPartnerSelect = document.getElementById('appointment-partner');
    const appointmentDateInput = document.getElementById('appointment-date');
    const appointmentTimeInput = document.getElementById('appointment-time');
    const appointmentTypeSelect = document.getElementById('appointment-type');
    const appointmentNotesInput = document.getElementById('appointment-notes');
    const appointmentListContainer = document.getElementById('appointment-list');
    const noAppointmentsMessage = document.getElementById('no-appointments-message');
    const toastNotification = document.getElementById('toast-notification');

    // --- Fonctions ---

    // Afficher une notification (toast)
    function showToast(message, type = 'success') {
        toastNotification.textContent = message;
        toastNotification.className = `toast toast-${type}`; // Reset classes and add new ones
        toastNotification.style.display = 'block';
        setTimeout(() => {
            toastNotification.style.display = 'none';
        }, 3000); // Cache après 3 secondes
    }

    // Rendu de la liste des partenaires
    function renderPartners(partners) {
        partnerListContainer.innerHTML = ''; // Vide la liste actuelle

        if (partners.length === 0) {
            noPartnersMessage.style.display = 'block';
            partnerListContainer.style.display = 'none';
            return;
        }

        noPartnersMessage.style.display = 'none';
        partnerListContainer.style.display = 'grid'; // Assure que le conteneur est visible

        partners.forEach(partner => {
            const card = document.createElement('div');
            card.className = 'card partner-card';
            card.innerHTML = `
                <div class="card-header">
                    <div>
                        <h3 class="card-title">${partner.name}</h3>
                        <span class="badge badge-${partner.category}">${categoryLabels[partner.category]}</span>
                    </div>
                    ${partner.logoUrl ? `<div class="logo"><img src="${partner.logoUrl}" alt="Logo ${partner.name}"></div>` : ''}
                </div>
                <div class="card-content">
                    <p class="description">${partner.description}</p>
                    <div class="contact-info">
                        ${partner.address ? `<div><i class="fas fa-map-marker-alt"></i><span>${partner.address}</span></div>` : ''}
                        ${partner.phone ? `<div><i class="fas fa-phone"></i><span>${partner.phone}</span></div>` : ''}
                        ${partner.email ? `<div><i class="fas fa-envelope"></i><span>${partner.email}</span></div>` : ''}
                        ${partner.website ? `<div><i class="fas fa-globe"></i><a href="${partner.website}" target="_blank" rel="noopener noreferrer">Site web</a></div>` : ''}
                    </div>
                    <div class="services">
                        <p>Services proposés :</p>
                        <ul>
                            ${partner.services.map(service => `<li>${service}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                <div class="card-footer">
                    <button class="button button-primary button-full take-appointment-btn" data-partner-id="${partner.id}" data-partner-name="${partner.name}">
                        Prendre rendez-vous
                    </button>
                </div>
            `;
            partnerListContainer.appendChild(card);
        });
    }

    // Rendu de la liste des rendez-vous
    function renderAppointments() {
        appointmentListContainer.innerHTML = ''; // Vide la liste actuelle

        if (appointmentsData.length === 0) {
            noAppointmentsMessage.style.display = 'block';
            appointmentListContainer.style.display = 'none';
        } else {
            noAppointmentsMessage.style.display = 'none';
            appointmentListContainer.style.display = 'flex'; // ou 'grid' selon le style souhaité

            appointmentsData.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time)); // Trie par date/heure

            appointmentsData.forEach(appointment => {
                const card = document.createElement('div');
                card.className = 'card appointment-card';
                card.dataset.appointmentId = appointment.id; // Ajoute l'ID pour la suppression

                const appointmentDate = new Date(appointment.date);
                const formattedDate = appointmentDate.toLocaleDateString('fr-FR', {
                    year: 'numeric', month: 'long', day: 'numeric'
                });

                card.innerHTML = `
                    <div class="appointment-details">
                        <div class="appointment-info">
                            <h3>${appointment.partnerName}</h3>
                            <div class="date-time">
                                <i class="fas fa-calendar-alt"></i>
                                <span>${formattedDate} à ${appointment.time}</span>
                            </div>
                             <span class="badge badge-${appointment.type.replace('é', 'e').replace('è', 'e')}">${appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}</span>
                        </div>
                        <button class="button button-destructive cancel-appointment-btn" data-appointment-id="${appointment.id}">
                            Annuler
                        </button>
                    </div>
                    ${appointment.notes ? `<div class="notes"><p>${appointment.notes}</p></div>` : ''}
                `;
                appointmentListContainer.appendChild(card);
            });
        }
    }

    // Filtrer et mettre à jour la liste des partenaires
    function filterAndRenderPartners() {
        const query = searchQueryInput.value.toLowerCase();
        const category = categoryFilterSelect.value;

        const filteredPartners = partnersData.filter(partner => {
            const matchesSearch = partner.name.toLowerCase().includes(query) ||
                                  partner.description.toLowerCase().includes(query);
            const matchesCategory = category === 'all' || partner.category === category;
            return matchesSearch && matchesCategory;
        });

        renderPartners(filteredPartners);
    }

    // Gestionnaire de soumission du formulaire de RDV
    function handleAppointmentSubmit(event) {
        event.preventDefault(); // Empêche le rechargement de la page

        const partnerId = appointmentPartnerSelect.value;
        const date = appointmentDateInput.value;
        const time = appointmentTimeInput.value;
        const type = appointmentTypeSelect.value;
        const notes = appointmentNotesInput.value.trim();

        if (!partnerId || !date || !time) {
            showToast("Veuillez remplir tous les champs obligatoires (Partenaire, Date, Heure).", "error");
            return;
        }

        const partner = partnersData.find(p => p.id === partnerId);
        if (!partner) {
            showToast("Erreur: Partenaire sélectionné introuvable.", "error");
            return;
        }

        const newAppointment = {
            id: `rdv_${Date.now()}`, // Génère un ID unique simple
            partnerId: partnerId,
            partnerName: partner.name,
            date: date,
            time: time,
            type: type,
            notes: notes || undefined // N'ajoute pas la clé si notes est vide
        };

        appointmentsData.push(newAppointment);
        localStorage.setItem('appointments', JSON.stringify(appointmentsData)); // Sauvegarde dans localStorage
        renderAppointments(); // Met à jour la liste des RDV
        appointmentForm.reset(); // Réinitialise le formulaire
        appointmentPartnerSelect.value = ""; // Assure que le select est bien réinitialisé

        showToast(`Rendez-vous avec ${partner.name} enregistré avec succès!`, "success");
        switchToTab('appointments'); // Bascule vers l'onglet des RDV
    }

    // Gestionnaire d'annulation de RDV (utilisant la délégation d'événements)
    function handleCancelAppointment(event) {
        const cancelButton = event.target.closest('.cancel-appointment-btn');
        if (cancelButton) {
            const appointmentId = cancelButton.dataset.appointmentId;
            // Confirmation avant suppression
             if (confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) {
                appointmentsData = appointmentsData.filter(app => app.id !== appointmentId);
                localStorage.setItem('appointments', JSON.stringify(appointmentsData)); // Met à jour localStorage
                renderAppointments(); // Met à jour l'affichage
                showToast("Rendez-vous annulé avec succès.", "success");
            }
        }
    }

     // Gestionnaire pour le bouton "Prendre rendez-vous" sur une carte partenaire
    function handleTakeAppointmentClick(event) {
         const takeButton = event.target.closest('.take-appointment-btn');
         if (takeButton) {
             const partnerId = takeButton.dataset.partnerId;
             appointmentPartnerSelect.value = partnerId; // Pré-sélectionne le partenaire dans le formulaire

             // Fait défiler la page jusqu'au formulaire
             const formContainer = document.getElementById('appointment-form-container');
             formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
             // Met le focus sur le champ date pour faciliter la saisie
             appointmentDateInput.focus();
         }
    }


    // Gestion du changement d'onglet
    function handleTabClick(event) {
        const clickedButton = event.target.closest('.tab-button');
        if (!clickedButton || clickedButton.classList.contains('active')) {
            return; // Ne fait rien si ce n'est pas un bouton ou si c'est déjà l'onglet actif
        }

        const tabId = clickedButton.dataset.tab;
        switchToTab(tabId);
    }

    // Fonction pour changer d'onglet programmatiquement
    window.switchToTab = function(tabId) { // Expose la fonction globalement pour l'appel depuis le HTML (onclick)
         tabButtons.forEach(button => {
            button.classList.remove('active');
            if (button.dataset.tab === tabId) {
                button.classList.add('active');
            }
        });

        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabId}-content`) {
                content.classList.add('active');
            }
        });

        // Re-render la liste des RDV si on passe à cet onglet (au cas où des changements ont eu lieu)
        if (tabId === 'appointments') {
            renderAppointments();
        }
    }


    // --- Initialisation ---

    // Remplir le select des partenaires dans le formulaire
    partnersData.forEach(partner => {
        const option = document.createElement('option');
        option.value = partner.id;
        option.textContent = partner.name;
        appointmentPartnerSelect.appendChild(option);
    });

     // Définir la date minimale pour le champ date (aujourd'hui)
    appointmentDateInput.min = new Date().toISOString().split('T')[0];


    // Affichage initial des partenaires et des rendez-vous
    filterAndRenderPartners();
    renderAppointments(); // Appelé une fois pour afficher l'état initial

    // --- Ajout des écouteurs d'événements ---
    searchQueryInput.addEventListener('input', filterAndRenderPartners);
    categoryFilterSelect.addEventListener('change', filterAndRenderPartners);
    appointmentForm.addEventListener('submit', handleAppointmentSubmit);
    tabsList.addEventListener('click', handleTabClick);

    // Utilisation de la délégation d'événements pour les boutons dynamiques
    appointmentListContainer.addEventListener('click', handleCancelAppointment);
    partnerListContainer.addEventListener('click', handleTakeAppointmentClick);




    document.addEventListener('DOMContentLoaded', () => {

        // --- Données simulées ---
        const documentsData = [
            {
                id: "doc1",
                title: "Mon CV",
                type: "Curriculum Vitae",
                date: "12/04/2025",
                status: "completed", // 'completed' ou 'draft'
                url: "#" // Lien de téléchargement/visualisation réel
            },
            {
                id: "doc2",
                title: "Lettre de motivation",
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
    
        // --- Références DOM ---
        const documentsListContainer = document.getElementById('documents-list');
        const noDocumentsMessage = document.getElementById('no-documents-message');
        const createDocBtn = document.getElementById('create-doc-btn');
        const helpDocBtn = document.getElementById('help-doc-btn');
        const downloadAllBtn = document.getElementById('download-all-btn');
    
        // --- Fonctions ---
    
        // Fonction pour afficher la liste des documents
        function renderDocuments(documents) {
            documentsListContainer.innerHTML = ''; // Vide la liste actuelle
    
            if (!documents || documents.length === 0) {
                noDocumentsMessage.style.display = 'block'; // Affiche le message si pas de documents
                return;
            } else {
                 noDocumentsMessage.style.display = 'none'; // Cache le message s'il y a des documents
            }
    
    
            documents.forEach(doc => {
                const docElement = document.createElement('div');
                docElement.className = 'document-item';
                docElement.innerHTML = `
                    <div class="info">
                        <strong class="title">${doc.title}</strong>
                        <p class="meta">
                            <span>${doc.type}</span>
                            <span>${doc.date}</span>
                        </p>
                    </div>
                    <div class="status">
                         <span class="status-badge ${doc.status}">${doc.status === 'completed' ? 'Complété' : 'Brouillon'}</span>
                    </div>
                    <div class="actions">
                        <!-- Ajoute ici des boutons si besoin (ex: voir, télécharger) -->
                        <a href="${doc.url}" class="button button-outline" title="Voir/Télécharger ${doc.title}" target="_blank" rel="noopener noreferrer">
                           <i class="fas fa-eye"></i>
                        </a>
                        <!-- Exemple: <button class="button button-secondary">Modifier</button> -->
                    </div>
                `;
                documentsListContainer.appendChild(docElement);
            });
        }
    
        // --- Gestionnaires d'événements ---
        createDocBtn.addEventListener('click', () => {
            window.alert("Fonctionnalité 'Créer un nouveau document' en développement");
        });
    
        helpDocBtn.addEventListener('click', () => {
            window.alert("Fonctionnalité 'Aide pour mes documents' en développement");
        });
    
        downloadAllBtn.addEventListener('click', () => {
            window.alert("Fonctionnalité 'Télécharger tous mes documents' en développement");
        });
    
    
        // --- Initialisation ---
        renderDocuments(documentsData); // Affiche les documents au chargement de la page
    

});
