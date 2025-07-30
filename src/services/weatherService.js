const axios = require('axios');
const config = require('../config/config');

class WeatherService {
  getWeatherEmoji(weatherMain) {
    const emojiMap = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '❄️',
      'Mist': '🌫️',
      'Fog': '🌫️',
      'Haze': '🌫️'
    };
    return emojiMap[weatherMain] || '🌤️';
  }

  extractCityFromMessage(message) {
    const patterns = [
      /météo\s+(?:à|de|pour)?\s*([a-zA-ZÀ-ÿ\s-]+)/i,
      /weather\s+(?:in|for)?\s*([a-zA-ZÀ-ÿ\s-]+)/i,
      /température\s+(?:à|de|pour)?\s*([a-zA-ZÀ-ÿ\s-]+)/i,
      /temps\s+(?:à|de|pour)?\s*([a-zA-ZÀ-ÿ\s-]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return null;
  }

  async getWeather(cityName) {
    try {
      if (!config.OPENWEATHER_API_KEY) {
        return {
          success: false,
          message: `🌤️ Météo de ${cityName}:\n\n☀️ Ensoleillé, 22°C\n🌡️ Ressenti: 24°C\n💨 Vent: 15 km/h\n💧 Humidité: 65%\n\n(Service météo en mode démo - configurez OPENWEATHER_API_KEY pour des données réelles)`
        };
      }

      const response = await axios.get(
        `${config.WEATHER_API_BASE}/weather?q=${encodeURIComponent(cityName)}&appid=${config.OPENWEATHER_API_KEY}&units=metric&lang=fr`
      );
      
      const weather = response.data;
      const temp = Math.round(weather.main.temp);
      const feelsLike = Math.round(weather.main.feels_like);
      const humidity = weather.main.humidity;
      const windSpeed = Math.round(weather.wind.speed * 3.6);
      const description = weather.weather[0].description;
      const weatherEmoji = this.getWeatherEmoji(weather.weather[0].main);
      
      const weatherMessage = [
        `🌤️ Météo à ${weather.name}, ${weather.sys.country}`,
        "",
        `${weatherEmoji} ${description.charAt(0).toUpperCase() + description.slice(1)}`,
        `🌡️ Température: ${temp}°C`,
        `🤗 Ressenti: ${feelsLike}°C`,
        `💨 Vent: ${windSpeed} km/h`,
        `💧 Humidité: ${humidity}%`,
        "",
        `📅 ${new Date().toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}`
      ].join("\n");
      
      return { success: true, message: weatherMessage };
      
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return {
          success: false,
          message: `❌ Désolé, je n'ai pas trouvé la ville "${cityName}". Vérifiez l'orthographe !`
        };
      }
      return {
        success: false,
        message: "❌ Erreur lors de la récupération de la météo. Réessayez plus tard."
      };
    }
  }
}

module.exports = new WeatherService();