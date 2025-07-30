# 🤖 Chatbot WhatsApp Intelligent v2.0

Un chatbot WhatsApp révolutionnaire avec intelligence artificielle DeepSeek et interface interactive avec boutons !

## 🚀 Nouvelles fonctionnalités v2.0

### 🧠 Intelligence Artificielle Avancée
- **DeepSeek AI** intégré pour des conversations naturelles
- **Mémoire contextuelle** - Se souvient des conversations
- **Réponses intelligentes** à toutes les questions
- **Analyse de sentiment** et réponses empathiques

### 🔘 Interface Interactive
- **Boutons interactifs** pour une navigation facile
- **Menus dynamiques** avec options claires
- **Expérience utilisateur** optimisée
- **Réponses guidées** pour tous les niveaux

### 🏗️ Architecture Modulaire
- **Code organisé** en modules séparés
- **Maintenance facile** et évolutive
- **Services découplés** pour chaque fonctionnalité
- **Structure professionnelle**

## 📁 Structure du projet

```
chatbot-whatsapp/
├── src/
│   ├── config/
│   │   └── config.js              # Configuration centralisée
│   ├── services/
│   │   ├── whatsappService.js     # Service WhatsApp (messages, boutons)
│   │   ├── deepseekService.js     # Service IA DeepSeek
│   │   └── weatherService.js      # Service météo
│   ├── handlers/
│   │   ├── messageHandler.js      # Gestionnaire principal des messages
│   │   └── menuHandler.js         # Gestionnaire des menus
│   ├── utils/
│   │   └── intentDetector.js      # Détection d'intentions
│   └── app.js                     # Application Express principale
├── index.js                       # Point d'entrée
├── package.json                   # Dépendances
├── .env                          # Variables d'environnement
└── README_V2.md                  # Cette documentation
```

## 🎯 Fonctionnalités

### 💬 Conversations Intelligentes
```
User: "Comment ça va ?"
Bot: "😊 Ça va très bien, merci ! Et vous, comment allez-vous ?"
[Boutons: 🌤️ Météo | 🎭 Divertissement | 🆘 Menu]
```

### 🌤️ Météo Interactive
```
User: "Météo Paris" ou clic sur bouton 🌤️ Météo
Bot: Affiche la météo + boutons pour autres actions
```

### 🎭 Divertissement avec Boutons
```
User: Clic sur 🎭 Divertissement
Bot: [Boutons: 😂 Blague | 💭 Citation | 💡 Fait surprenant]
```

### 🤖 IA Contextuelle
```
User: "Traduis 'hello world' en français"
Bot: "🌐 TRADUCTION
━━━━━━━━━━━━━━━━━━━━
'Hello world' se traduit par 'Bonjour le monde' en français."
[Boutons pour continuer]
```

## 🛠️ Installation

### 1. Cloner et installer
```bash
git clone <votre-repo>
cd chatbot-whatsapp
npm install
```

### 2. Configuration .env
```env
# WhatsApp (OBLIGATOIRE)
WHATSAPP_TOKEN=votre_token_whatsapp
VERIFY_TOKEN=votre_token_verification

# DeepSeek AI (RECOMMANDÉ)
DEEPSEEK_API_KEY=sk-votre-cle-deepseek

# APIs optionnelles
OPENWEATHER_API_KEY=votre_cle_openweather
NEWS_API_KEY=votre_cle_newsapi
TMDB_API_KEY=votre_cle_tmdb
```

### 3. Démarrer
```bash
npm start
# ou pour le développement
npm run dev
```

## 🔧 Configuration DeepSeek

### Pourquoi DeepSeek ?
- **💰 Très économique** (~$0.014 pour 1000 conversations)
- **🚀 Performant** (qualité GPT-4)
- **🌍 Excellent en français**
- **⚡ Réponses rapides**

### Obtenir une clé API
1. Aller sur [platform.deepseek.com](https://platform.deepseek.com)
2. Créer un compte (5$ de crédit gratuit)
3. Générer une clé API
4. Ajouter dans `.env`: `DEEPSEEK_API_KEY=sk-votre-cle`

## 🎮 Utilisation

### Interface avec Boutons
Le chatbot propose automatiquement des boutons pour faciliter la navigation :

```
👋 Salut !
[🌤️ Mét��o] [📰 Actualités] [🎭 Divertissement]
```

### Conversations Naturelles
Parlez naturellement, l'IA comprend :
- "Il fait quel temps à Lyon ?"
- "Raconte-moi une blague"
- "Comment faire du pain ?"
- "Traduis 'hello' en français"

### Commandes Rapides
- `menu` - Menu principal
- `aide` - Aide et fonctionnalités
- Nom de ville - Météo directe

## 🔍 Fonctionnement Technique

### Flux de traitement des messages
1. **Réception** → `app.js` reçoit le webhook
2. **Routage** → `messageHandler.js` analyse le message
3. **Détection** → `intentDetector.js` identifie l'intention
4. **Traitement** → Service approprié traite la demande
5. **Réponse** → `whatsappService.js` envoie la réponse + boutons

### Services modulaires
- **WhatsAppService** : Envoi messages, boutons, listes
- **DeepSeekService** : IA conversationnelle avec mémoire
- **WeatherService** : Météo avec extraction intelligente de ville
- **MessageHandler** : Orchestration et logique métier

## 🚨 Dépannage

### Le bot ne répond pas intelligemment
1. Vérifier `DEEPSEEK_API_KEY` dans `.env`
2. Redémarrer le serveur après modification
3. Consulter les logs pour erreurs

### Boutons ne fonctionnent pas
1. Vérifier la version WhatsApp Business API
2. Tester avec des titres de boutons courts (<20 caractères)

### Erreurs DeepSeek
```
❌ Erreur DeepSeek: Invalid API key
```
→ Vérifier que la clé commence par `sk-`

## 📊 Monitoring

Le serveur affiche l'état de configuration au démarrage :
```
🚀 Chatbot WhatsApp Intelligent démarré !
📡 Serveur actif sur le port 3000

🔧 Configuration:
   WhatsApp Token: ✅ Configuré
   DeepSeek API: ✅ Configuré
   OpenWeather API: ⚠️ Mode démo
```

## 🎯 Exemples d'interactions

### Conversation naturelle avec boutons
```
User: "Bonjour"
Bot: "👋 Salut ! Je suis votre assistant WhatsApp intelligent !
     🤖 Je peux vous aider avec plein de choses..."
     [🌤️ Météo] [📰 Actualités] [🎭 Divertissement]

User: Clic sur 🌤️ Météo
Bot: "🌍 Pour quelle ville voulez-vous la météo ?"
     [🗼 Paris] [🦁 Lyon] [🌊 Marseille]

User: Clic sur 🗼 Paris
Bot: "🌤️ Météo à Paris, France
     ☀️ Ensoleillé, 22°C..."
     [🌤️ Autre ville] [📰 Actualités] [🆘 Menu]
```

### IA conversationnelle
```
User: "Je me sens triste aujourd'hui"
Bot: "😔 Je suis désolé d'apprendre que vous vous sentez triste. 
     Voulez-vous en parler ? Je peux aussi vous proposer une 
     blague pour vous remonter le moral ?"
     [😂 Blague] [💭 Citation] [🆘 Menu]
```

## 🔄 Migration depuis v1.0

Si vous avez l'ancienne version :
1. Sauvegarder votre `.env`
2. Remplacer tous les fichiers par la v2.0
3. Restaurer votre `.env`
4. `npm install` pour les nouvelles dépendances
5. `npm start`

## 🚀 Déploiement

### Local avec ngrok
```bash
npm start
# Dans un autre terminal
npx ngrok http 3000
```

### Production (Heroku, VPS, etc.)
1. Configurer les variables d'environnement
2. `npm start`
3. Configurer le webhook WhatsApp vers votre URL

---

**🎉 Votre chatbot est maintenant super intelligent et interactif !**

Pour toute question : créez une issue ou consultez la documentation DeepSeek.