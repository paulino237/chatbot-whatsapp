const axios = require('axios');
const config = require('../config/config');

class DeepSeekService {
  constructor() {
    this.conversationHistory = new Map();
    this.maxHistoryLength = 20; // 10 échanges
  }

  async getResponse(userId, userMessage, context = null) {
    try {
      if (!config.DEEPSEEK_API_KEY) {
        console.log('⚠️ DeepSeek API key non configurée, utilisation du mode fallback');
        return this.getFallbackResponse(userMessage);
      }

      // Récupérer l'historique
      const history = this.conversationHistory.get(userId) || [];
      
      // Construire le prompt système avec contexte
      let systemPrompt = `Tu es un assistant WhatsApp intelligent et amical nommé "Assistant IA". 

RÈGLES IMPORTANTES:
- Réponds TOUJOURS en français
- Sois concis (max 300 caractères pour WhatsApp)
- Utilise des emojis appropriés
- Sois utile et informatif
- Si tu ne sais pas, dis-le honnêtement

CAPACITÉS:
- Conversations naturelles
- Réponses aux questions
- Conseils et suggestions
- Traductions
- Calculs simples
- Explications

${context ? `CONTEXTE SPÉCIAL: ${context}` : ''}

Réponds de manière naturelle et amicale.`;

      const messages = [
        { role: "system", content: systemPrompt },
        ...history.slice(-10), // Garder les 10 derniers messages
        { role: "user", content: userMessage }
      ];

      console.log('🤖 Envoi requête à DeepSeek...');
      
      const response = await axios.post(
        `${config.DEEPSEEK_API_BASE}/chat/completions`,
        {
          model: config.DEEPSEEK_MODEL,
          messages: messages,
          max_tokens: 500,
          temperature: 0.7,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${config.DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 secondes timeout
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      
      // Mettre à jour l'historique
      this.updateHistory(userId, userMessage, aiResponse);
      
      console.log('✅ Réponse DeepSeek reçue');
      return aiResponse;

    } catch (error) {
      console.error('❌ Erreur DeepSeek:', error.response?.data || error.message);
      
      // En cas d'erreur, utiliser le fallback
      return this.getFallbackResponse(userMessage);
    }
  }

  updateHistory(userId, userMessage, aiResponse) {
    const history = this.conversationHistory.get(userId) || [];
    
    history.push(
      { role: "user", content: userMessage },
      { role: "assistant", content: aiResponse }
    );
    
    // Limiter la taille de l'historique
    if (history.length > this.maxHistoryLength) {
      history.splice(0, history.length - this.maxHistoryLength);
    }
    
    this.conversationHistory.set(userId, history);
  }

  getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Réponses intelligentes basiques
    if (lowerMessage.includes('comment') && lowerMessage.includes('ça va')) {
      return "😊 Ça va très bien, merci ! Et vous, comment allez-vous ?";
    }
    
    if (lowerMessage.includes('merci')) {
      return "😊 De rien ! Je suis là pour vous aider. Avez-vous d'autres questions ?";
    }
    
    if (lowerMessage.includes('qui es-tu') || lowerMessage.includes('qui êtes-vous')) {
      return "🤖 Je suis votre assistant WhatsApp intelligent ! Je peux vous aider avec plein de choses. Tapez 'menu' pour découvrir mes fonctionnalités !";
    }

    if (lowerMessage.includes('aide') || lowerMessage.includes('help')) {
      return "🤖 Je peux vous aider avec la météo, actualités, films, blagues, citations et bien plus ! Tapez 'menu' pour voir toutes les options.";
    }

    // Questions simples
    if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut')) {
      return "👋 Bonjour ! Comment puis-je vous aider aujourd'hui ? Tapez 'menu' pour voir mes fonctionnalités.";
    }

    if (lowerMessage.includes('au revoir') || lowerMessage.includes('bye')) {
      return "👋 Au revoir ! N'hésitez pas à revenir si vous avez besoin d'aide !";
    }

    // Réponse par défaut plus intelligente
    return "🤔 Je ne suis pas sûr de comprendre votre demande. Pouvez-vous reformuler ou tapez 'menu' pour voir ce que je peux faire ?";
  }

  clearHistory(userId) {
    this.conversationHistory.delete(userId);
  }

  getHistorySize(userId) {
    return this.conversationHistory.get(userId)?.length || 0;
  }
}

module.exports = new DeepSeekService();