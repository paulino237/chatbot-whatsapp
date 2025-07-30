const whatsappService = require('../services/whatsappService');

class MenuHandler {
  async sendMainMenu(userId) {
    const menuText = [
      "🎯 MENU PRINCIPAL",
      "━━━━━━━━━━━━━━━━━━━━",
      "",
      "Choisissez une option ci-dessous ou parlez-moi naturellement !",
      "",
      "💡 Exemples :",
      "• 'Météo Paris'",
      "• 'Raconte-moi une blague'",
      "• 'Comment ça va ?'",
      "• 'Traduis hello en français'"
    ].join("\n");

    const buttons = [
      { id: 'weather_btn', title: '🌤️ Météo' },
      { id: 'news_btn', title: '📰 Actualités' },
      { id: 'entertainment_btn', title: '🎭 Divertissement' }
    ];

    await whatsappService.sendButtons(
      userId,
      menuText,
      buttons,
      "🤖 Assistant IA",
      "Tapez n'importe quoi pour discuter !"
    );
  }

  async sendWeatherMenu(userId) {
    const sections = [
      {
        title: "Villes populaires",
        rows: [
          {
            id: "weather_paris",
            title: "Paris",
            description: "Météo à Paris, France"
          },
          {
            id: "weather_lyon", 
            title: "Lyon",
            description: "Météo à Lyon, France"
          },
          {
            id: "weather_marseille",
            title: "Marseille", 
            description: "Météo à Marseille, France"
          },
          {
            id: "weather_custom",
            title: "Autre ville",
            description: "Tapez le nom d'une ville"
          }
        ]
      }
    ];

    await whatsappService.sendList(
      userId,
      "Choisissez une ville pour connaître la météo :",
      sections,
      "🌤️ Service Météo",
      "Ou tapez le nom d'une ville directement"
    );
  }

  async sendEntertainmentMenu(userId) {
    const sections = [
      {
        title: "Divertissement",
        rows: [
          {
            id: "joke_random",
            title: "Blague aléatoire",
            description: "Une blague pour vous faire rire"
          },
          {
            id: "quote_random",
            title: "Citation inspirante", 
            description: "Une citation motivante"
          },
          {
            id: "fact_random",
            title: "Fait surprenant",
            description: "Un fait intéressant à découvrir"
          }
        ]
      }
    ];

    await whatsappService.sendList(
      userId,
      "Que voulez-vous pour vous divertir ?",
      sections,
      "🎭 Divertissement"
    );
  }
}

module.exports = new MenuHandler();