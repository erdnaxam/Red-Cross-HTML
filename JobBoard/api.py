from flask import Flask, request, jsonify
import requests
from flask_cors import CORS
from dotenv import load_dotenv
import os

# ➕ Calculer le chemin du .env situé dans ../backend-openai/.env
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend-openai", ".env"))

# 🧪 Vérification du chemin
print("🔍 Chargement du .env depuis :", env_path)

# ✅ Charger les variables
load_dotenv(dotenv_path=env_path)

CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")

# ✅ Vérifier que les variables ont bien été lues
if not CLIENT_ID or not CLIENT_SECRET:
    raise RuntimeError("❌ CLIENT_ID ou CLIENT_SECRET non trouvés dans ../backend-openai/.env")


# ✅ Initialisation Flask
app = Flask(__name__)
CORS(app)

# 🔐 Fonction pour récupérer le token
def get_token():
    url = "https://entreprise.pole-emploi.fr/connexion/oauth2/access_token?realm=/partenaire"
    data = {
        "grant_type": "client_credentials",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "scope": "api_offresdemploiv2 o2dsoffre"
    }
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }

    response = requests.post(url, data=data, headers=headers)
    response.raise_for_status()
    return response.json().get("access_token")

# 🔍 Recherche d'offres
@app.route("/api/jobs", methods=["GET"])
def get_jobs():
    mots_cles = request.args.get("motsCles", "")
    token = get_token()
    headers = {
        "Authorization": f"Bearer {token}"
    }

    url = "https://api.pole-emploi.io/partenaire/offresdemploi/v2/offres/search?range=0-9"
    if mots_cles:
        url += f"&motsCles={mots_cles}"

    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return jsonify(response.json())

# 📄 Récupération d'une offre par ID
@app.route("/api/job/<string:job_id>", methods=["GET"])
def get_job_by_id(job_id):
    token = get_token()
    headers = {
        "Authorization": f"Bearer {token}"
    }

    url = f"https://api.pole-emploi.io/partenaire/offresdemploi/v2/offres/{job_id}"
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return jsonify(response.json())

# 🚀 Lancement serveur
if __name__ == "__main__":
    app.run(debug=True)
