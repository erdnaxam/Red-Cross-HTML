// ameliorer_lettre.js

// Fonction pour lire un fichier Word (.docx) avec mammoth.js
async function readDocx(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const arrayBuffer = event.target.result;
      const result = await window.mammoth.extractRawText({ arrayBuffer });
      resolve(result.value);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// Fonction pour lire un fichier PDF avec pdf.js
async function readPDF(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async function (event) {
      const typedarray = new Uint8Array(event.target.result);

      const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
      let text = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map(item => item.str).join(' ');
        text += strings + '\n';
      }

      resolve(text);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// Gestionnaire d'événement du formulaire
document.getElementById('uploadForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];

  if (!file) {
    alert("Veuillez sélectionner un fichier.");
    return;
  }

  let textContent = "";

  if (file.name.endsWith('.docx')) {
    textContent = await readDocx(file);
  } else if (file.name.endsWith('.pdf')) {
    textContent = await readPDF(file);
  } else {
    alert("Format de fichier non supporté.");
    return;
  }

  // Appel à ton backend (ex: localhost:3000/api/ameliore-lettre)
  const response = await fetch("http://localhost:3001/api/ameliore-lettre", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texte: textContent })
  });

  const result = await response.json();

if (result?.ameliore) {
  document.getElementById('outputContainer').style.display = 'block';

  // Remplir les deux colonnes
  document.getElementById('originalText').value = textContent.trim();
  document.getElementById('improvedText').value = result.ameliore.trim();
} else {
  alert("Erreur lors de l'amélioration. Veuillez réessayer.");
}})

document.getElementById('downloadServerWordBtn').addEventListener('click', async () => {
  const improvedText = document.getElementById('improvedText').value;

  const response = await fetch("http://localhost:3001/api/export-word", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texte: improvedText })
  });

  if (!response.ok) {
    alert("Erreur lors de la génération du fichier Word.");
    return;
  }

  // Récupération du fichier en blob
  const blob = await response.blob();

  // Création et téléchargement du lien
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "lettre_ameliorée.docx";
  document.body.appendChild(a);
  a.click();
  a.remove();
});

