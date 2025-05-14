
  const synth = window.speechSynthesis;

  function getSelectedLanguageCode() {
    const langSelect = document.getElementById("langSwitcher");
    const lang = langSelect.value;
    switch (lang) {
      case 'fr': return 'fr-FR';
      case 'en': return 'en-GB';
      case 'ar': return 'ar-SA';
      case 'uk': return 'uk-UA';
      default: return 'fr-FR';
    }
  }

  function readVisibleText() {
    if (synth.speaking) {
      synth.cancel(); // Arrêter toute lecture en cours
    }

    const textToRead = document.body.innerText;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = getSelectedLanguageCode();

    const voices = synth.getVoices();
    const chosenVoice = voices.find(voice => voice.lang === utterance.lang);
    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    synth.speak(utterance);
  }

  // Chargement des voix (asynchrone parfois)
  window.speechSynthesis.onvoiceschanged = () => {
    // Récupère les voix à jour quand elles sont chargées
  };

  // Lancer la lecture quand on clique sur le bouton
  document.addEventListener("DOMContentLoaded", () => {
    const ttsBtn = document.getElementById("ttsBtn");
    if (ttsBtn) {
      ttsBtn.addEventListener("click", readVisibleText);
    }
  });

