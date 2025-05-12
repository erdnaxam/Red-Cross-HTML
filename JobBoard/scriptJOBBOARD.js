async function loadOffre() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    document.getElementById("offre-details").innerText = "Aucune offre sélectionnée.";
    return;
  }

  const response = await fetch(`http://127.0.0.1:5000/api/job/${id}`);
  const job = await response.json();

  const lienCandidature = job.origineOffre?.url && job.origineOffre.url.startsWith("http")
    ? job.origineOffre.url
    : `https://candidat.francetravail.fr/offres/recherche?motsCles=${encodeURIComponent(job.intitule)}&offresPartenaires=true`;

  const html = `
    <h1>${job.intitule}</h1>
    <p><strong>Entreprise:</strong> ${job.entreprise?.nom || "Non précisé"}</p>
    <p><strong>Lieu:</strong> ${job.lieuTravail?.libelle || "Non précisé"}</p>
    <p><strong>Description complète :</strong></p>
    <p>${job.description}</p>
    <a href="${lienCandidature}" target="_blank" class="button-postuler">Postuler sur France Travail</a>
  `;

  document.getElementById("offre-details").innerHTML = html;
}

loadOffre();
