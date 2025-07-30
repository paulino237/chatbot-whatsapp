# 🤖 Chatbot WhatsApp Intelligent

Un chatbot WhatsApp avancé avec intelligence conversationnelle et intégration d'APIs gratuites pour la météo, actualités, films, blagues et plus encore !

## 🚀 Fonctionnalités

### 🌤️ Météo Dynamique
- Récupération de la météo en temps réel pour n'importe quelle ville
- Détection intelligente du nom de ville dans les messages
- Informations complètes : température, ressenti, vent, humidité
- Emojis adaptatifs selon les conditions météo

### 📰 Actualités en Temps Réel
- Dernières actualités françaises
- Sources fiables via NewsAPI
- Mise à jour automatique

### 🎬 Informations Cinéma
- Films populaires du moment
- Recherche de films par titre
- Informations détaillées (note, date de sortie, synopsis)

### 😂 Divertissement
- Blagues aléatoires en anglais
- Citations inspirantes
- Faits surprenants et intéressants
- Contenu de secours si les APIs sont indisponibles

### 🧠 Intelligence Conversationnelle
- Détection automatique des intentions
- Gestion des contextes de conversation
- Compréhension du langage naturel
- Réponses adaptatives

## 📋 Prérequis

- Node.js (version 14 ou supérieure)
- Compte WhatsApp Business
- Token d'accès WhatsApp Business API
- Clés API (optionnelles mais recommandées)

## 🛠️ Installation

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd chatbot-whatsapp
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
Créez un fichier `.env` à la racine du projet :

```env
# WhatsApp Business API (OBLIGATOIRE)
WHATSAPP_TOKEN=votre_token_whatsapp
VERIFY_TOKEN=votre_token_de_verification

# APIs Optionnelles (mais recommandées)
OPENWEATHER_API_KEY=votre_cle_openweather
NEWS_API_KEY=votre_cle_newsapi
TMDB_API_KEY=votre_cle_tmdb
```

4. **Démarrer le serveur**
```bash
node index.js
```

## 🔑 Configuration des APIs

### OpenWeatherMap (Météo) - GRATUIT
1. Créez un compte sur [OpenWeatherMap](https://openweathermap.org/api)
2. Obtenez votre clé API gratuite
3. Ajoutez `OPENWEATHER_API_KEY=votre_cle` dans le fichier `.env`

### NewsAPI (Actualités) - GRATUIT
1. Créez un compte sur [NewsAPI](https://newsapi.org/)
2. Obtenez votre clé API gratuite
3. Ajoutez `NEWS_API_KEY=votre_cle` dans le fichier `.env`

### TMDB (Films) - GRATUIT
1. Créez un compte sur [The Movie Database](https://www.themoviedb.org/settings/api)
2. Obtenez votre clé API gratuite
3. Ajoutez `TMDB_API_KEY=votre_cle` dans le fichier `.env`

## 💬 Utilisation

### Commandes Naturelles
Le bot comprend le langage naturel ! Exemples :

```
👋 Salutations :
- "Bonjour", "Salut", "Hello"

🌤️ Météo :
- "Météo Paris"
- "Il fait quel temps à Lyon ?"
- "Température Marseille"

📰 Actualités :
- "Actualités"
- "News du jour"
- "Infos"

😂 Divertissement :
- "Raconte-moi une blague"
- "Citation inspirante"
- "Fait intéressant"

🎬 Cinéma :
- "Films populaires"
- "Rechercher un film"

🆘 Aide :
- "Menu"
- "Aide"
- "Help"
```

### Mode Démo
Si les clés API ne sont pas configurées, le bot fonctionne en mode démo avec des données d'exemple.

## 🏗️ Architecture

```
chatbot-whatsapp/
├── index.js              # Fichier principal
├── package.json          # Dépendances
├── .env                  # Variables d'environnement
├── README.md             # Documentation
└── .env.example          # Exemple de configuration
```

### Fonctions Principales

- `handleMessage()` - Gestion intelligente des messages
- `getWeatherForCity()` - Récupération météo
- `getAdvancedNews()` - Actualités en temps réel
- `getRandomJoke()` - Blagues aléatoires
- `getRandomQuote()` - Citations inspirantes
- `extractCityFromMessage()` - Extraction intelligente de ville

## 🔧 Personnalisation

### Ajouter de Nouvelles Fonctionnalités

1. **Nouvelle détection d'intention**
```javascript
function isNewFeatureRequest(message) {
  const keywords = ['mot-clé1', 'mot-clé2'];
  return keywords.some(keyword => message.includes(keyword));
}
```

2. **Nouvelle fonction de traitement**
```javascript
async function handleNewFeature(to) {
  // Votre logique ici
  await sendMessage(to, "Réponse de la nouvelle fonctionnalité");
}
```

3. **Intégrer dans handleMessage()**
```javascript
else if (isNewFeatureRequest(userMessage)) {
  await handleNewFeature(userId);
}
```

### Modifier les Réponses
Toutes les réponses sont facilement modifiables dans les fonctions correspondantes.

## 🚀 Déploiement

### Déploiement Local avec ngrok
```bash
# Installer ngrok
npm install -g ngrok

# Démarrer le serveur
node index.js

# Dans un autre terminal
ngrok http 3000
```

### Déploiement sur Heroku
1. Créez une app Heroku
2. Configurez les variables d'environnement
3. Déployez le code

### Déploiement sur VPS
1. Installez Node.js sur votre serveur
2. Clonez le projet
3. Configurez PM2 pour la gestion des processus
4. Configurez nginx comme reverse proxy

## 🐛 Dépannage

### Problèmes Courants

1. **Le bot ne répond pas**
   - Vérifiez le token WhatsApp
   - Vérifiez l'URL du webhook
   - Consultez les logs du serveur

2. **Météo ne fonctionne pas**
   - Vérifiez la clé OpenWeatherMap
   - Testez l'API directement

3. **Actualités indisponibles**
   - Vérifiez la clé NewsAPI
   - Vérifiez les quotas de l'API

### Logs et Debug
```bash
# Démarrer avec logs détaillés
DEBUG=* node index.js
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- OpenWeatherMap pour l'API météo gratuite
- NewsAPI pour les actualités
- TMDB pour les informations cinéma
- WhatsApp Business API
- Toutes les APIs gratuites utilisées

## 📞 Support

Pour toute question ou problème :
1. Consultez la documentation
2. Vérifiez les issues existantes
3. Créez une nouvelle issue si nécessaire

---

**Fait avec ❤️ pour la communauté des développeurs**