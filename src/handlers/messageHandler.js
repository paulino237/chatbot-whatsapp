const whatsappService = require('../services/whatsappService');
const deepseekService = require('../services/deepseekService');
const weatherService = require('../services/weatherService');
const foodService = require('../services/foodService');
const intentDetector = require('../utils/intentDetector');
const menuHandler = require('./menuHandler');

class MessageHandler {
  constructor() {
    this.conversationStates = new Map();
  }

  async handleMessage(messages) {
    const userId = messages.from;
    const userState = this.conversationStates.get(userId) || { context: 'none', data: {} };

    if (messages.type === 'text') {
      await this.handleTextMessage(messages, userId, userState);
    } else if (messages.type === 'interactive') {
      await this.handleInteractiveMessage(messages, userId);
    }
  }

  async handleTextMessage(messages, userId, userState) {
    const userMessage = messages.text.body.trim();
    const lowerMessage = userMessage.toLowerCase();

    // Gestion des contextes de conversation
    if (userState.context === 'waiting_city') {
      await this.handleWeatherRequest(userId, userMessage);
      this.conversationStates.delete(userId);
      return;
    }

    if (userState.context === 'waiting_food_search') {
      await this.handleFoodRequest(userId, userMessage);
      this.conversationStates.delete(userId);
      return;
    }

    // Détection des intentions avec boutons
    if (intentDetector.isGreeting(lowerMessage)) {
      await this.sendWelcomeWithButtons(userId);
    }
    else if (intentDetector.isBarcodeMessage(userMessage)) {
      await this.handleBarcodeRequest(userId, userMessage);
    }
    else if (intentDetector.isFoodRequest(lowerMessage) || intentDetector.isFoodSearchRequest(lowerMessage)) {
      await this.handleFoodRequest(userId, userMessage);
    }
    else if (intentDetector.isWeatherRequest(lowerMessage)) {
      await this.handleWeatherRequest(userId, userMessage);
    }
    else if (intentDetector.isNewsRequest(lowerMessage)) {
      await this.handleNewsRequest(userId);
    }
    else if (intentDetector.isMovieRequest(lowerMessage)) {
      await this.handleMovieRequest(userId);
    }
    else if (intentDetector.isEntertainmentRequest(lowerMessage)) {
      await this.handleEntertainmentRequest(userId);
    }
    else if (lowerMessage === 'menu' || lowerMessage === 'aide' || lowerMessage === 'help') {
      await menuHandler.sendMainMenu(userId);
    }
    else {
      // Utiliser DeepSeek pour toutes les autres questions
      await this.handleIntelligentResponse(userId, userMessage);
    }
  }

  async handleInteractiveMessage(messages, userId) {
    const interactiveType = messages.interactive.type;
    
    if (interactiveType === 'button_reply') {
      const buttonId = messages.interactive.button_reply.id;
      await this.handleButtonResponse(userId, buttonId);
    } else if (interactiveType === 'list_reply') {
      const listId = messages.interactive.list_reply.id;
      await this.handleListResponse(userId, listId);
    }
  }

  async handleButtonResponse(userId, buttonId) {
    switch (buttonId) {
      case 'weather_btn':
        await this.promptForCity(userId);
        break;
      case 'news_btn':
        await this.handleNewsRequest(userId);
        break;
      case 'entertainment_btn':
        await this.handleEntertainmentRequest(userId);
        break;
      case 'movies_btn':
        await this.handleMovieRequest(userId);
        break;
      case 'help_btn':
        await this.sendHelpWithButtons(userId);
        break;
      case 'joke_btn':
        await this.getRandomJoke(userId);
        break;
      case 'quote_btn':
        await this.getRandomQuote(userId);
        break;
      case 'fact_btn':
        await this.getRandomFact(userId);
        break;
      // ===== BOUTONS ALIMENTAIRES =====
      case 'food_btn':
        await this.sendFoodMenu(userId);
        break;
      case 'food_search_btn':
        await this.promptForFoodSearch(userId);
        break;
      case 'food_category_btn':
        await this.sendFoodCategories(userId);
        break;
      case 'food_demo_btn':
        await this.sendFoodDemo(userId);
        break;
      // Boutons de villes pour la météo
      case 'paris_weather':
        await this.handleWeatherRequest(userId, 'Paris');
        break;
      case 'lyon_weather':
        await this.handleWeatherRequest(userId, 'Lyon');
        break;
      case 'marseille_weather':
        await this.handleWeatherRequest(userId, 'Marseille');
        break;
      default:
        await whatsappService.sendMessage(userId, "🤔 Option non reconnue. Tapez 'menu' pour voir les options disponibles.");
    }
  }

  async sendWelcomeWithButtons(userId) {
    const welcomeText = [
      "👋 Salut ! Je suis votre assistant WhatsApp intelligent !",
      "",
      "🤖 Je peux vous aider avec plein de choses :",
      "• Météo en temps réel",
      "• Informations nutritionnelles", 
      "• Actualités du jour", 
      "• Divertissement",
      "• Films et séries",
      "• Conversations naturelles",
      "",
      "Que voulez-vous faire ?"
    ].join("\n");

    const buttons = [
      { id: 'weather_btn', title: '🌤️ Météo' },
      { id: 'food_btn', title: '🍽️ Nutrition' },
      { id: 'entertainment_btn', title: '🎭 Divertissement' }
    ];

    await whatsappService.sendButtons(
      userId, 
      welcomeText, 
      buttons,
      "🤖 Assistant IA",
      "Tapez 'menu' pour plus d'options"
    );
  }

  async handleWeatherRequest(userId, message) {
    const city = weatherService.extractCityFromMessage(message);
    
    if (city) {
      const result = await weatherService.getWeather(city);
      await whatsappService.sendMessage(userId, result.message);
      
      // Proposer d'autres actions
      const buttons = [
        { id: 'weather_btn', title: '🌤️ Autre ville' },
        { id: 'news_btn', title: '📰 Actualités' },
        { id: 'help_btn', title: '🆘 Menu' }
      ];
      
      await whatsappService.sendButtons(
        userId,
        "Que voulez-vous faire maintenant ?",
        buttons
      );
    } else {
      await this.promptForCity(userId);
    }
  }

  async promptForCity(userId) {
    this.conversationStates.set(userId, { context: 'waiting_city', data: {} });
    
    const buttons = [
      { id: 'paris_weather', title: '🗼 Paris' },
      { id: 'lyon_weather', title: '🦁 Lyon' },
      { id: 'marseille_weather', title: '🌊 Marseille' }
    ];

    await whatsappService.sendButtons(
      userId,
      "🌍 Pour quelle ville voulez-vous la météo ?\n\nVous pouvez choisir une ville ci-dessous ou taper le nom d'une ville :",
      buttons,
      "🌤️ Service Météo"
    );
  }

  async handleNewsRequest(userId) {
    const newsMessage = [
      "📰 ACTUALITÉS DU JOUR",
      "━━━━━━━━━━━━━━━━━━━━",
      "",
      "1. 🌍 Actualité internationale importante",
      "2. 🏛️ Politique française en mouvement", 
      "3. 💼 Économie et marchés financiers",
      "4. ⚽ Sport et compétitions",
      "5. 🔬 Sciences et technologies",
      "",
      "(Service actualités en mode démo)"
    ].join("\n");

    await whatsappService.sendMessage(userId, newsMessage);

    const buttons = [
      { id: 'weather_btn', title: '🌤️ Météo' },
      { id: 'entertainment_btn', title: '🎭 Divertissement' },
      { id: 'help_btn', title: '🆘 Menu' }
    ];

    await whatsappService.sendButtons(
      userId,
      "Que voulez-vous faire maintenant ?",
      buttons
    );
  }

  async handleEntertainmentRequest(userId) {
    const buttons = [
      { id: 'joke_btn', title: '😂 Blague' },
      { id: 'quote_btn', title: '💭 Citation' },
      { id: 'fact_btn', title: '💡 Fait surprenant' }
    ];

    await whatsappService.sendButtons(
      userId,
      "🎭 Que voulez-vous pour vous divertir ?",
      buttons,
      "🎪 Divertissement"
    );
  }

  async handleMovieRequest(userId) {
    const moviesMessage = [
      "🎬 FILMS POPULAIRES",
      "━━━━━━━━━━━━━━━━━━━━",
      "",
      "1. 🎭 Avatar: La Voie de l'eau",
      "2. 🦸 Black Panther: Wakanda Forever",
      "3. 🏃 Top Gun: Maverick",
      "4. 🧙 Les Animaux fantastiques 3",
      "5. 🚗 Fast & Furious 10",
      "",
      "(Service films en mode démo)"
    ].join("\n");

    await whatsappService.sendMessage(userId, moviesMessage);

    const buttons = [
      { id: 'entertainment_btn', title: '🎭 Divertissement' },
      { id: 'news_btn', title: '📰 Actualités' },
      { id: 'help_btn', title: '🆘 Menu' }
    ];

    await whatsappService.sendButtons(
      userId,
      "Que voulez-vous faire maintenant ?",
      buttons
    );
  }

  async getRandomJoke(userId) {
    const jokes = [
      "Pourquoi les plongeurs plongent-ils toujours en arrière et jamais en avant ?\n\nParce que sinon, ils tombent dans le bateau ! 😂",
      "Que dit un escargot quand il croise une limace ?\n\nRegarde, un nudiste ! 🐌",
      "Comment appelle-t-on un chat tombé dans un pot de peinture le jour de Noël ?\n\nUn chat-mallow ! 🎨"
    ];

    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
    
    await whatsappService.sendMessage(userId, `😂 BLAGUE DU JOUR\n━━━━━━━━━━━━━━━━━━━━\n\n${randomJoke}`);

    const buttons = [
      { id: 'joke_btn', title: '😂 Autre blague' },
      { id: 'quote_btn', title: '💭 Citation' },
      { id: 'help_btn', title: '🆘 Menu' }
    ];

    await whatsappService.sendButtons(
      userId,
      "Voulez-vous autre chose ?",
      buttons
    );
  }

  async getRandomQuote(userId) {
    const quotes = [
      '"La vie, c\'est comme une bicyclette, il faut avancer pour ne pas perdre l\'équilibre."\n\n✍️ Albert Einstein',
      '"Le succès, c\'est tomber sept fois et se relever huit."\n\n✍️ Proverbe japonais',
      '"L\'imagination est plus importante que la connaissance."\n\n✍️ Albert Einstein'
    ];

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    
    await whatsappService.sendMessage(userId, `💭 CITATION INSPIRANTE\n━━━━━━━━━━━━━━━━━━━━\n\n${randomQuote}`);

    const buttons = [
      { id: 'quote_btn', title: '💭 Autre citation' },
      { id: 'fact_btn', title: '💡 Fait surprenant' },
      { id: 'help_btn', title: '🆘 Menu' }
    ];

    await whatsappService.sendButtons(
      userId,
      "Voulez-vous autre chose ?",
      buttons
    );
  }

  async getRandomFact(userId) {
    const facts = [
      "Les pieuvres ont trois cœurs et du sang bleu ! 🐙",
      "Un groupe de flamants roses s'appelle une 'flamboyance' ! 🦩", 
      "Les bananes sont radioactives (mais sans danger) ! 🍌",
      "Il y a plus d'arbres sur Terre que d'étoiles dans la Voie lactée ! 🌳"
    ];

    const randomFact = facts[Math.floor(Math.random() * facts.length)];
    
    await whatsappService.sendMessage(userId, `💡 LE SAVIEZ-VOUS ?\n━━━━━━━━━━━━━━━━━━━━\n\n${randomFact}`);

    const buttons = [
      { id: 'fact_btn', title: '💡 Autre fait' },
      { id: 'joke_btn', title: '😂 Blague' },
      { id: 'help_btn', title: '🆘 Menu' }
    ];

    await whatsappService.sendButtons(
      userId,
      "Voulez-vous autre chose ?",
      buttons
    );
  }

  async sendHelpWithButtons(userId) {
    const helpText = [
      "🆘 AIDE & FONCTIONNALITÉS",
      "━━━━━━━━━━━━━━━━━━━━",
      "",
      "🌤️ MÉTÉO : Tapez 'météo Paris' ou utilisez les boutons",
      "🍽️ NUTRITION : Analysez des produits alimentaires",
      "📰 ACTUALITÉS : Dernières news du jour",
      "🎭 DIVERTISSEMENT : Blagues, citations, faits",
      "🎬 FILMS : Films populaires et recherche",
      "💬 CONVERSATION : Posez-moi n'importe quelle question !",
      "",
      "💡 ASTUCE : Parlez-moi naturellement, je comprends !",
      "🔍 NUTRITION : Envoyez un code-barres ou tapez 'produit [nom]'"
    ].join("\n");

    await whatsappService.sendMessage(userId, helpText);

    const buttons = [
      { id: 'weather_btn', title: '🌤️ Météo' },
      { id: 'food_btn', title: '🍽️ Nutrition' },
      { id: 'entertainment_btn', title: '🎭 Divertissement' }
    ];

    await whatsappService.sendButtons(
      userId,
      "Que voulez-vous faire ?",
      buttons
    );
  }

  async handleIntelligentResponse(userId, userMessage) {
    try {
      // Utiliser DeepSeek pour une réponse intelligente
      const aiResponse = await deepseekService.getResponse(userId, userMessage);
      await whatsappService.sendMessage(userId, aiResponse);

      // Proposer des actions après la réponse
      const buttons = [
        { id: 'weather_btn', title: '🌤️ Météo' },
        { id: 'food_btn', title: '🍽️ Nutrition' },
        { id: 'entertainment_btn', title: '🎭 Divertissement' },
        { id: 'help_btn', title: '🆘 Menu' }
      ];

      await whatsappService.sendButtons(
        userId,
        "Puis-je vous aider avec autre chose ?",
        buttons
      );

    } catch (error) {
      console.error('Erreur réponse intelligente:', error);
      await whatsappService.sendMessage(
        userId, 
        "🤔 Désolé, je n'ai pas pu traiter votre demande. Tapez 'menu' pour voir mes fonctionnalités."
      );
    }
  }

  // ===== NOUVELLES FONCTIONS ALIMENTAIRES =====

  async handleBarcodeRequest(userId, message) {
    const barcode = foodService.extractBarcodeFromMessage(message);
    
    if (barcode) {
      await whatsappService.sendMessage(userId, "🔍 Recherche du produit en cours...");
      
      const result = await foodService.getProductByBarcode(barcode);
      
      if (result.success) {
        await whatsappService.sendMessage(userId, result.data);
        
        // Proposer des actions supplémentaires
        const buttons = [
          { id: 'food_search_btn', title: '🔍 Autre produit' },
          { id: 'food_category_btn', title: '📂 Catégories' },
          { id: 'help_btn', title: '🆘 Menu' }
        ];
        
        await whatsappService.sendButtons(
          userId,
          "Voulez-vous analyser un autre produit ?",
          buttons
        );
      } else {
        await whatsappService.sendMessage(userId, result.message);
        await this.sendFoodHelpButtons(userId);
      }
    }
  }

  async handleFoodRequest(userId, message) {
    const productName = foodService.extractProductNameFromMessage(message);
    
    if (productName) {
      await whatsappService.sendMessage(userId, `🔍 Recherche de "${productName}" en cours...`);
      
      const result = await foodService.searchProductsByName(productName, 3);
      
      if (result.success) {
        let searchMessage = [
          "🔍 RÉSULTATS DE RECHERCHE",
          "━━━━━━━━━━━━━━━━━━━━",
          ""
        ];
        
        result.data.forEach((product, index) => {
          searchMessage.push(`${index + 1}. ${product.display}`);
          searchMessage.push("");
        });
        
        searchMessage.push("💡 Envoyez un code-barres pour plus de détails !");
        
        await whatsappService.sendMessage(userId, searchMessage.join("\n"));
        
        // Proposer des actions
        const buttons = [
          { id: 'food_search_btn', title: '🔍 Autre recherche' },
          { id: 'food_category_btn', title: '📂 Catégories' },
          { id: 'help_btn', title: '🆘 Menu' }
        ];
        
        await whatsappService.sendButtons(
          userId,
          "Que voulez-vous faire ?",
          buttons
        );
      } else {
        await whatsappService.sendMessage(userId, result.message);
        await this.sendFoodHelpButtons(userId);
      }
    } else {
      await this.sendFoodMenu(userId);
    }
  }

  async sendFoodMenu(userId) {
    const foodText = [
      "🍽️ INFORMATIONS NUTRITIONNELLES",
      "━━━━━━━━━━━━━━━━━━━━",
      "",
      "Je peux vous aider à analyser des produits alimentaires !",
      "",
      "📱 COMMENT UTILISER :",
      "• Envoyez un code-barres (ex: 3017620422003)",
      "• Tapez 'produit [nom]' (ex: produit nutella)",
      "• Choisissez une catégorie ci-dessous",
      "",
      "📊 J'ANALYSE :",
      "• Nutri-Score et NOVA",
      "• Ingrédients et additifs",
      "• Valeurs nutritionnelles",
      "• Allergènes"
    ].join("\n");

    const buttons = [
      { id: 'food_search_btn', title: '🔍 Rechercher' },
      { id: 'food_category_btn', title: '📂 Catégories' },
      { id: 'food_demo_btn', title: '🧪 Démo' }
    ];

    await whatsappService.sendButtons(
      userId,
      foodText,
      buttons,
      "🍽️ Nutrition & Santé",
      "Données fournies par OpenFoodFacts"
    );
  }

  async sendFoodCategories(userId) {
    const categories = foodService.getPopularCategories();
    
    const sections = [
      {
        title: "Catégories populaires",
        rows: categories.map(cat => ({
          id: `food_cat_${cat.id}`,
          title: `${cat.emoji} ${cat.name}`,
          description: `Découvrir les ${cat.name.toLowerCase()}`
        }))
      }
    ];

    await whatsappService.sendList(
      userId,
      "Choisissez une catégorie d'aliments à explorer :",
      sections,
      "📂 Catégories Alimentaires",
      "Données OpenFoodFacts"
    );
  }

  async sendFoodDemo(userId) {
    // Démonstration avec un produit populaire (Nutella)
    await whatsappService.sendMessage(userId, "🧪 Démonstration avec un produit populaire...");
    
    const result = await foodService.getProductByBarcode("3017620422003"); // Code-barres Nutella
    
    if (result.success) {
      await whatsappService.sendMessage(userId, result.data);
      
      const buttons = [
        { id: 'food_search_btn', title: '🔍 Rechercher' },
        { id: 'food_category_btn', title: '📂 Catégories' },
        { id: 'help_btn', title: '🆘 Menu' }
      ];
      
      await whatsappService.sendButtons(
        userId,
        "Essayez maintenant avec vos propres produits !",
        buttons
      );
    } else {
      await whatsappService.sendMessage(userId, "❌ Erreur lors de la démonstration. Essayez avec un autre code-barres !");
      await this.sendFoodHelpButtons(userId);
    }
  }

  async sendFoodHelpButtons(userId) {
    const buttons = [
      { id: 'food_search_btn', title: '🔍 Rechercher' },
      { id: 'food_category_btn', title: '📂 Catégories' },
      { id: 'help_btn', title: '🆘 Menu' }
    ];

    await whatsappService.sendButtons(
      userId,
      "Comment puis-je vous aider avec la nutrition ?",
      buttons
    );
  }

  async handleListResponse(userId, listId) {
    // Gérer les réponses de liste pour les catégories alimentaires
    if (listId.startsWith('food_cat_')) {
      const categoryId = listId.replace('food_cat_', '');
      await this.handleFoodCategorySelection(userId, categoryId);
    } else {
      await whatsappService.sendMessage(userId, "🤔 Option non reconnue. Tapez 'menu' pour voir les options disponibles.");
    }
  }

  async promptForFoodSearch(userId) {
    this.conversationStates.set(userId, { context: 'waiting_food_search', data: {} });
    
    await whatsappService.sendMessage(
      userId,
      "🔍 RECHERCHE DE PRODUIT\n━━━━━━━━━━━━━━━━━━━━\n\nTapez le nom du produit que vous voulez analyser :\n\nExemples :\n• Nutella\n• Coca Cola\n• Pain de mie\n• Yaourt nature\n\nOu envoyez directement un code-barres !"
    );
  }

  async handleFoodCategorySelection(userId, categoryId) {
    await whatsappService.sendMessage(userId, `🔍 Recherche de produits dans la catégorie "${categoryId}"...`);
    
    const result = await foodService.getProductsByCategory(categoryId, 5);
    
    if (result.success) {
      let categoryMessage = [
        `📂 PRODUITS - ${categoryId.toUpperCase()}`,
        "━━━━━━━━━━━━━━━━━━━━",
        ""
      ];
      
      result.data.forEach((product, index) => {
        categoryMessage.push(`${index + 1}. ${product.display}`);
        categoryMessage.push("");
      });
      
      categoryMessage.push("💡 Envoyez un code-barres pour plus de détails !");
      
      await whatsappService.sendMessage(userId, categoryMessage.join("\n"));
      
      const buttons = [
        { id: 'food_category_btn', title: '📂 Autres catégories' },
        { id: 'food_search_btn', title: '🔍 Rechercher' },
        { id: 'help_btn', title: '🆘 Menu' }
      ];
      
      await whatsappService.sendButtons(
        userId,
        "Que voulez-vous faire ?",
        buttons
      );
    } else {
      await whatsappService.sendMessage(userId, result.message);
      await this.sendFoodHelpButtons(userId);
    }
  }
}

module.exports = new MessageHandler();