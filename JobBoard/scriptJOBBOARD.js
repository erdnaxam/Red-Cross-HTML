async function searchJobs() {
  const keyword = document.getElementById("keyword").value.trim();
  let url = "http://127.0.0.1:5000/api/jobs";

  if (keyword !== "") {
    url += `?motsCles=${encodeURIComponent(keyword)}`;
  }

  const response = await fetch(url);
  const data = await response.json();
  displayJobs(data.resultats);
}

function displayJobs(jobs) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  if (jobs.length === 0) {
    container.innerHTML = "<p>Aucune offre trouvée.</p>";
    return;
  }

  jobs.forEach(job => {
    const div = document.createElement("div");
    div.className = "job";

    const isFavorite = checkFavorite(job.id);

    // Nouveau lien vers la page dédiée
    const lienOffre = `<a href="offre.html?id=${job.id}">Voir l'offre complète</a>`;

    const favoriBtn = `<button onclick="toggleFavorite('${job.id}', this)">
      ${isFavorite ? "★ Retirer des favoris" : "☆ Ajouter aux favoris"}
    </button>`;

    div.innerHTML = `
      <h2>${job.intitule}</h2>
      <p><strong>Entreprise:</strong> ${job.entreprise?.nom || "Non précisé"}</p>
      <p><strong>Lieu:</strong> ${job.lieuTravail?.libelle || "Non précisé"}</p>
      <p><strong>Description:</strong> ${job.description?.substring(0, 300)}...</p>
      ${lienOffre}<br><br>
      ${favoriBtn}
    `;

    container.appendChild(div);
  });
}

function checkFavorite(id) {
  const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  return favorites.includes(id);
}

function toggleFavorite(id, button) {
  let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

  if (favorites.includes(id)) {
    favorites = favorites.filter(fav => fav !== id);
    button.textContent = "☆ Ajouter aux favoris";
  } else {
    favorites.push(id);
    button.textContent = "★ Retirer des favoris";
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
}

async function loadFavorites() {
  const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

  if (favorites.length === 0) {
    document.getElementById("results").innerHTML = "<p>Aucun favori enregistré.</p>";
    return;
  }

  const allJobs = [];

  for (let id of favorites) {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/job/${id}`);
      const job = await res.json();
      allJobs.push(job);
    } catch (e) {
      console.warn("Offre non trouvée :", id);
    }
  }

  displayJobs(allJobs);
}
