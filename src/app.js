const express = require('express');
const config = require('./config/config');
const messageHandler = require('./handlers/messageHandler');

const app = express();
app.use(express.json());

// Route de base
app.get('/', (req, res) => {
  res.json({
    status: 'active',
    message: 'Chatbot WhatsApp Intelligent avec DeepSeek AI',
    features: [
      '🌤️ Météo dynamique',
      '📰 Actualités en temps réel', 
      '🎭 Divertissement interactif',
      '🎬 Informations cinéma',
      '🤖 Intelligence conversationnelle',
      '🔘 Interface avec boutons'
    ]
  });
});

// Webhook verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const challenge = req.query['hub.challenge'];
  const token = req.query['hub.verify_token'];

  if (mode && token === config.WEBHOOK_VERIFY_TOKEN) {
    console.log('✅ Webhook vérifié avec succès');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Échec de vérification du webhook');
    res.sendStatus(403);
  }
});

// Webhook pour recevoir les messages
app.post('/webhook', async (req, res) => {
  try {
    const { entry } = req.body;

    if (!entry || entry.length === 0) {
      return res.status(400).send('Invalid Request');
    }

    const changes = entry[0].changes;

    if (!changes || changes.length === 0) {
      return res.status(400).send('Invalid Request');
    }

    const statuses = changes[0].value.statuses ? changes[0].value.statuses[0] : null;
    const messages = changes[0].value.messages ? changes[0].value.messages[0] : null;

    if (statuses) {
      console.log(`📱 Statut message: ${statuses.id} - ${statuses.status}`);
    }

    if (messages) {
      console.log(`💬 Nouveau message de ${messages.from}: ${messages.text?.body || 'Message interactif'}`);
      await messageHandler.handleMessage(messages);
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ Erreur webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Gestion des erreurs globales
app.use((error, req, res, next) => {
  console.error('❌ Erreur serveur:', error);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Démarrage du serveur
app.listen(config.PORT, () => {
  console.log('🚀 Chatbot WhatsApp Intelligent démarré !');
  console.log(`📡 Serveur actif sur le port ${config.PORT}`);
  console.log('');
  console.log('📱 Fonctionnalités disponibles:');
  console.log('   🌤️  Météo dynamique avec boutons');
  console.log('   📰 Actualités en temps réel');
  console.log('   🎭 Divertissement interactif');
  console.log('   🎬 Informations cinéma');
  console.log('   🤖 Intelligence conversationnelle DeepSeek');
  console.log('   🔘 Interface utilisateur avec boutons');
  console.log('');
  console.log('🔧 Configuration:');
  console.log(`   WhatsApp Token: ${config.WHATSAPP_ACCESS_TOKEN ? '✅ Configuré' : '❌ Manquant'}`);
  console.log(`   DeepSeek API: ${config.DEEPSEEK_API_KEY ? '✅ Configuré' : '⚠️ Mode démo'}`);
  console.log(`   OpenWeather API: ${config.OPENWEATHER_API_KEY ? '✅ Configuré' : '⚠️ Mode démo'}`);
  console.log(`   News API: ${config.NEWS_API_KEY ? '✅ Configuré' : '⚠️ Mode démo'}`);
  console.log('');
});

module.exports = app;