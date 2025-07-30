require('dotenv').config();

module.exports = {
  // WhatsApp Configuration
  WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_TOKEN,
  WEBHOOK_VERIFY_TOKEN: process.env.VERIFY_TOKEN || 'votre_token_de_verification',
  WHATSAPP_PHONE_ID: '706515409217281',
  
  // API Keys
  TMDB_API_KEY: process.env.TMDB_API_KEY,
  OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY,
  NEWS_API_KEY: process.env.NEWS_API_KEY,
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
  
  // API Endpoints
  WEATHER_API_BASE: 'https://api.openweathermap.org/data/2.5',
  NEWS_API_BASE: 'https://newsapi.org/v2',
  FACTS_API: 'https://uselessfacts.jsph.pl/random.json',
  QUOTES_API: 'https://api.quotable.io/random',
  JOKES_API: 'https://official-joke-api.appspot.com/random_joke',
  
  // DeepSeek Configuration
  DEEPSEEK_API_BASE: 'https://api.deepseek.com/v1',
  DEEPSEEK_MODEL: 'deepseek-chat',
  
  // Server Configuration
  PORT: process.env.PORT || 3000
};