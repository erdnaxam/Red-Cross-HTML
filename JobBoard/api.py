from flask import Flask, request, jsonify
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Autoriser le front-end local (http://127.0.0.1:5500) à appeler l'API

# Remplace ces valeurs par tes vraies clés API France Travail
CLIENT_ID = "PAR_emploiavenir_2c9f76d7db9ccbb3ac92fcfbed4a9d33124d4633f5e502a95533e754ff74aac4"
CLIENT_SECRET = "90dde5cbb303d2052db11dd06adc0907f6e3bede5993bfeebe63c6a61a16cbf1"

# Fonction pour récupérer un token OAuth2
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

# Route : recherche d'offres (avec mots clés)
@app.route("/api/jobs", methods=["GET"])
def get_jobs():
    mots_cles = request.args.get("motsCles", "")
    token = get_token()
    headers = {
        "Authorization": f"Bearer {token}"
    }

    url = f"https://api.pole-emploi.io/partenaire/offresdemploi/v2/offres/search?range=0-9"
    if mots_cles:
        url += f"&motsCles={mots_cles}"

    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return jsonify(response.json())

# Route : récupérer une offre spécifique par son ID
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

# Lancer le serveur Flask
if __name__ == "__main__":
    app.run(debug=True)
