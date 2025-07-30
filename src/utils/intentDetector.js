class IntentDetector {
  isGreeting(message) {
    const greetings = ['hello', 'hi', 'bonjour', 'salut', 'bonsoir', 'hey', 'coucou'];
    return greetings.some(greeting => message.includes(greeting));
  }

  isWeatherRequest(message) {
    const weatherKeywords = ['météo', 'meteo', 'weather', 'température', 'temperature', 'temps', 'climat'];
    return weatherKeywords.some(keyword => message.includes(keyword));
  }

  isNewsRequest(message) {
    const newsKeywords = ['actualités', 'actualites', 'news', 'infos', 'nouvelles', 'journal'];
    return newsKeywords.some(keyword => message.includes(keyword));
  }

  isMovieRequest(message) {
    const movieKeywords = ['film', 'movie', 'cinéma', 'cinema', 'série', 'serie'];
    return movieKeywords.some(keyword => message.includes(keyword));
  }

  isEntertainmentRequest(message) {
    const entertainmentKeywords = [
      'blague', 'joke', 'drôle', 'drole', 'rigolo', 'marrant', 'humour',
      'citation', 'quote', 'phrase', 'proverbe', 'sagesse',
      'fait', 'fact', 'saviez-vous', 'info', 'connaissance', 'culture',
      'divertissement', 'entertainment', 'amusement'
    ];
    return entertainmentKeywords.some(keyword => message.includes(keyword));
  }

  isTranslationRequest(message) {
    const translationKeywords = ['traduis', 'translate', 'traduction', 'translation', 'en français', 'en anglais', 'en espagnol'];
    return translationKeywords.some(keyword => message.includes(keyword));
  }

  isCalculationRequest(message) {
    const calcKeywords = ['calcul', 'calculate', 'combien', 'plus', 'moins', 'fois', 'divisé', '+', '-', '*', '/', '='];
    return calcKeywords.some(keyword => message.includes(keyword)) || /\d+[\+\-\*\/]\d+/.test(message);
  }

  isGeneralQuestion(message) {
    const questionWords = ['comment', 'pourquoi', 'quand', 'où', 'qui', 'quoi', 'que', 'quel', 'quelle'];
    return questionWords.some(word => message.startsWith(word)) || message.includes('?');
  }

  analyzeSentiment(message) {
    const positiveWords = ['content', 'heureux', 'joie', 'super', 'génial', 'parfait', 'excellent', 'bien'];
    const negativeWords = ['triste', 'mal', 'problème', 'difficile', 'ennui', 'fatigue', 'stress'];
    
    const positive = positiveWords.some(word => message.includes(word));
    const negative = negativeWords.some(word => message.includes(word));
    
    if (positive && !negative) return 'positive';
    if (negative && !positive) return 'negative';
    return 'neutral';
  }
}

module.exports = new IntentDetector();