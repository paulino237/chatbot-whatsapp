const axios = require('axios');

class FoodService {
  constructor() {
    this.baseURL = 'https://world.openfoodfacts.org/api/v2';
    this.searchURL = 'https://world.openfoodfacts.org/cgi/search.pl';
    
    // Configuration des champs à récupérer pour optimiser les requêtes
    this.detailedFields = [
      'product_name', 'brands', 'categories', 'labels_tags',
      'nutriscore_grade', 'nova_group', 'ecoscore_grade',
      'nutriments', 'ingredients_text', 'allergens_tags', 'additives_tags',
      'image_url', 'image_front_url', 'image_nutrition_url',
      'serving_size', 'packaging', 'origins', 'manufacturing_places',
      'stores', 'countries_tags', 'purchase_places',
      'nutriscore_data', 'nutrition_grades_tags',
      'ingredients_analysis_tags', 'food_groups_tags'
    ].join(',');
    
    this.searchFields = [
      'product_name', 'brands', 'nutriscore_grade', 'nova_group',
      'ecoscore_grade', 'image_url', 'code', 'categories',
      'nutrition_grades_tags', 'labels_tags'
    ].join(',');
  }

  // Rechercher un produit par code-barres
  async getProductByBarcode(barcode) {
    try {
      const response = await axios.get(`${this.baseURL}/product/${barcode}.json`);
      
      if (response.data.status === 0) {
        return {
          success: false,
          message: `❌ Produit avec le code-barres ${barcode} non trouvé dans la base de données.`
        };
      }

      const product = response.data.product;
      return {
        success: true,
        data: this.formatProductInfo(product)
      };

    } catch (error) {
      console.error('Erreur OpenFoodFacts barcode:', error.message);
      return {
        success: false,
        message: "❌ Erreur lors de la recherche du produit. Vérifiez le code-barres."
      };
    }
  }

  // Rechercher des produits par nom
  async searchProductsByName(productName, limit = 5) {
    try {
      const response = await axios.get(this.searchURL, {
        params: {
          search_terms: productName,
          search_simple: 1,
          action: 'process',
          json: 1,
          page_size: limit,
          fields: this.searchFields,
          sort_by: 'popularity'
        }
      });

      if (!response.data.products || response.data.products.length === 0) {
        return {
          success: false,
          message: `❌ Aucun produit trouvé pour "${productName}".\n\n💡 Essayez :\n• Un nom plus simple (ex: "nutella" au lieu de "pâte à tartiner nutella")\n• Une marque connue\n• Un terme générique (ex: "chocolat", "yaourt")`
        };
      }

      return {
        success: true,
        data: response.data.products.map(product => this.formatSearchResult(product))
      };

    } catch (error) {
      console.error('Erreur OpenFoodFacts search:', error.message);
      return {
        success: false,
        message: "❌ Erreur lors de la recherche de produits. Vérifiez votre connexion internet."
      };
    }
  }

  // Obtenir des produits par catégorie
  async getProductsByCategory(category, limit = 5) {
    try {
      const response = await axios.get(this.searchURL, {
        params: {
          tagtype_0: 'categories',
          tag_contains_0: 'contains',
          tag_0: category,
          action: 'process',
          json: 1,
          page_size: limit,
          fields: this.searchFields,
          sort_by: 'popularity'
        }
      });

      if (!response.data.products || response.data.products.length === 0) {
        return {
          success: false,
          message: `❌ Aucun produit trouvé dans la catégorie "${category}".\n\n💡 Essayez une autre catégorie ou une recherche par nom de produit.`
        };
      }

      return {
        success: true,
        data: response.data.products.map(product => this.formatSearchResult(product))
      };

    } catch (error) {
      console.error('Erreur OpenFoodFacts category:', error.message);
      return {
        success: false,
        message: "❌ Erreur lors de la recherche par catégorie. Vérifiez votre connexion internet."
      };
    }
  }

  // Analyser les ingrédients d'un produit
  async analyzeIngredients(barcode) {
    try {
      const response = await axios.get(`${this.baseURL}/product/${barcode}.json`);
      
      if (response.data.status === 0) {
        return {
          success: false,
          message: `❌ Produit non trouvé.`
        };
      }

      const product = response.data.product;
      return {
        success: true,
        data: this.formatIngredientsAnalysis(product)
      };

    } catch (error) {
      console.error('Erreur analyse ingrédients:', error.message);
      return {
        success: false,
        message: "❌ Erreur lors de l'analyse des ingrédients."
      };
    }
  }

  // Formater les informations complètes d'un produit
  formatProductInfo(product) {
    const name = product.product_name || product.product_name_fr || 'Nom non disponible';
    const brands = product.brands || 'Marque non disponible';
    const nutriscore = product.nutriscore_grade ? product.nutriscore_grade.toUpperCase() : null;
    const nova = product.nova_group || null;
    const ecoscore = product.ecoscore_grade ? product.ecoscore_grade.toUpperCase() : null;
    
    // Informations nutritionnelles détaillées
    const nutrition = product.nutriments || {};
    const energy = this.formatNutrient(nutrition, 'energy-kcal_100g', 'kcal');
    const energyKj = this.formatNutrient(nutrition, 'energy-kj_100g', 'kJ');
    const fat = this.formatNutrient(nutrition, 'fat_100g', 'g');
    const saturatedFat = this.formatNutrient(nutrition, 'saturated-fat_100g', 'g');
    const carbs = this.formatNutrient(nutrition, 'carbohydrates_100g', 'g');
    const sugar = this.formatNutrient(nutrition, 'sugars_100g', 'g');
    const fiber = this.formatNutrient(nutrition, 'fiber_100g', 'g');
    const protein = this.formatNutrient(nutrition, 'proteins_100g', 'g');
    const salt = this.formatNutrient(nutrition, 'salt_100g', 'g');
    const sodium = this.formatNutrient(nutrition, 'sodium_100g', 'mg');

    // Scores avec emojis
    const scores = this.getScoresWithEmojis(nutriscore, nova, ecoscore);
    
    // Analyser les labels et certifications
    const labels = this.analyzeLabels(product.labels_tags || []);
    
    // Analyser les allergènes
    const allergens = this.analyzeAllergens(product.allergens_tags || []);
    
    // Analyser les additifs
    const additives = this.analyzeAdditives(product.additives_tags || []);
    
    // Analyser l'origine et la fabrication
    const origin = this.analyzeOrigin(product);
    
    // Portion et emballage
    const servingInfo = this.getServingInfo(product);
    
    // Obtenir les recommandations
    const recommendation = this.getNutritionalRecommendation(nutriscore, nova, product);

    let result = [
      `🍽️ ANALYSE NUTRITIONNELLE COMPLÈTE`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ``,
      `📦 **${name}**`,
      `🏷️ ${brands}`,
      ``
    ];

    // Section scores
    result.push(`📊 **SCORES QUALITÉ**`);
    result.push(`🎯 Nutri-Score: ${scores.nutriscore}`);
    result.push(`⚗️ NOVA: ${scores.nova}`);
    if (scores.ecoscore) {
      result.push(`🌱 Eco-Score: ${scores.ecoscore}`);
    }
    result.push(``);

    // Section nutrition
    result.push(`🥗 **VALEURS NUTRITIONNELLES (100g)**`);
    result.push(`⚡ Énergie: ${energy}${energyKj !== 'Non disponible' ? ` (${energyKj})` : ''}`);
    result.push(`🥩 Protéines: ${protein}`);
    result.push(`🍞 Glucides: ${carbs}`);
    result.push(`   └ 🍯 dont sucres: ${sugar}`);
    result.push(`🧈 Matières grasses: ${fat}`);
    result.push(`   └ 🔴 dont saturées: ${saturatedFat}`);
    result.push(`🌾 Fibres: ${fiber}`);
    result.push(`🧂 Sel: ${salt}${sodium !== 'Non disponible' ? ` (${sodium} sodium)` : ''}`);
    result.push(``);

    // Section portion si disponible
    if (servingInfo) {
      result.push(`📏 **PORTION**`);
      result.push(servingInfo);
      result.push(``);
    }

    // Section labels et certifications
    if (labels) {
      result.push(`🏷️ **LABELS & CERTIFICATIONS**`);
      result.push(labels);
      result.push(``);
    }

    // Section allergènes
    if (allergens) {
      result.push(`⚠️ **ALLERGÈNES**`);
      result.push(allergens);
      result.push(``);
    }

    // Section additifs
    result.push(`🧬 **ADDITIFS**`);
    result.push(additives);
    result.push(``);

    // Section origine si disponible
    if (origin) {
      result.push(`🌍 **ORIGINE & FABRICATION**`);
      result.push(origin);
      result.push(``);
    }

    // Section recommandations
    result.push(`💡 **RECOMMANDATIONS SANTÉ**`);
    result.push(recommendation);
    result.push(``);

    // Catégories
    const categories = this.formatCategories(product.categories);
    if (categories) {
      result.push(`📂 **CATÉGORIES**`);
      result.push(categories);
      result.push(``);
    }

    result.push(`🔍 *Données OpenFoodFacts - Code: ${product.code || 'N/A'}*`);

    return result.join('\n');
  }

  // Formater les résultats de recherche
  formatSearchResult(product) {
    const name = product.product_name || 'Nom non disponible';
    const brands = product.brands || 'Marque inconnue';
    const nutriscore = product.nutriscore_grade ? product.nutriscore_grade.toUpperCase() : '?';
    const nova = product.nova_group || '?';

    const nutriscoreEmoji = {
      'A': '🟢', 'B': '🟡', 'C': '🟠', 'D': '🔴', 'E': '⚫'
    };

    return {
      name,
      brands,
      nutriscore: nutriscoreEmoji[nutriscore] || '❓',
      nova: nova !== '?' ? `Nova ${nova}` : '❓',
      code: product.code,
      display: `📦 **${name}**\n🏷️ ${brands}\n🎯 ${nutriscoreEmoji[nutriscore] || '❓'} | ⚗️ Nova ${nova}`
    };
  }

  // Formater l'analyse des ingrédients
  formatIngredientsAnalysis(product) {
    const name = product.product_name || 'Produit';
    const ingredients = product.ingredients_text || 'Ingrédients non disponibles';
    const allergens = product.allergens || 'Non spécifiés';
    const additives = product.additives_tags || [];
    
    let analysis = [
      `🔬 ANALYSE DES INGRÉDIENTS`,
      `━━━━━━━━━━━━━━━━━━━━`,
      ``,
      `📦 **${name}**`,
      ``,
      `🧪 **INGRÉDIENTS:**`,
      ingredients,
      ``
    ];

    if (allergens && allergens !== 'Non spécifiés') {
      analysis.push(`⚠️ **ALLERGÈNES:**`);
      analysis.push(allergens);
      analysis.push(``);
    }

    if (additives.length > 0) {
      analysis.push(`🧬 **ADDITIFS DÉTECTÉS:**`);
      additives.slice(0, 5).forEach(additive => {
        analysis.push(`• ${additive.replace('en:', '')}`);
      });
      if (additives.length > 5) {
        analysis.push(`... et ${additives.length - 5} autres`);
      }
      analysis.push(``);
    }

    analysis.push(`💡 *Analyse basée sur OpenFoodFacts*`);

    return analysis.join('\n');
  }

  // Extraire le code-barres d'un message
  extractBarcodeFromMessage(message) {
    // Recherche d'un code-barres (généralement 8, 12, 13 ou 14 chiffres)
    const barcodePattern = /\b\d{8,14}\b/;
    const match = message.match(barcodePattern);
    return match ? match[0] : null;
  }

  // Extraire le nom de produit d'un message
  extractProductNameFromMessage(message) {
    // Patterns pour extraire le nom de produit
    const patterns = [
      /produit\s+(.+)/i,
      /cherche\s+(.+)/i,
      /recherche\s+(.+)/i,
      /info\s+(.+)/i,
      /nutrition\s+(.+)/i
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return null;
  }

  // Suggestions de catégories populaires
  getPopularCategories() {
    return [
      { id: 'chocolates', name: 'Chocolats', emoji: '🍫' },
      { id: 'yogurts', name: 'Yaourts', emoji: '🥛' },
      { id: 'cereals', name: 'Céréales', emoji: '🥣' },
      { id: 'cheeses', name: 'Fromages', emoji: '🧀' },
      { id: 'breads', name: 'Pains', emoji: '🍞' },
      { id: 'beverages', name: 'Boissons', emoji: '🥤' },
      { id: 'fruits', name: 'Fruits', emoji: '🍎' },
      { id: 'vegetables', name: 'Légumes', emoji: '🥕' }
    ];
  }

  // Obtenir des recommandations nutritionnelles basées sur le Nutri-Score
  getNutritionalRecommendation(nutriscoreGrade, novaGroup) {
    let recommendation = "";
    
    // Recommandations basées sur le Nutri-Score
    switch (nutriscoreGrade?.toUpperCase()) {
      case 'A':
        recommendation += "✅ Excellent choix nutritionnel ! Ce produit a un très bon profil nutritionnel.";
        break;
      case 'B':
        recommendation += "👍 Bon choix ! Ce produit a une qualité nutritionnelle correcte.";
        break;
      case 'C':
        recommendation += "⚠️ Qualité nutritionnelle moyenne. À consommer avec modération.";
        break;
      case 'D':
        recommendation += "🔶 Qualité nutritionnelle médiocre. Limitez la consommation.";
        break;
      case 'E':
        recommendation += "❌ Mauvaise qualité nutritionnelle. À éviter ou consommer très occasionnellement.";
        break;
      default:
        recommendation += "ℹ️ Nutri-Score non disponible pour ce produit.";
    }

    // Recommandations basées sur NOVA
    if (novaGroup) {
      recommendation += "\n\n";
      switch (novaGroup.toString()) {
        case '1':
          recommendation += "🌱 Aliment non transformé ou minimalement transformé. Excellent pour la santé !";
          break;
        case '2':
          recommendation += "🧂 Ingrédient culinaire transformé. Utilisez avec modération.";
          break;
        case '3':
          recommendation += "⚠️ Aliment transformé. Consommez occasionnellement dans le cadre d'une alimentation équilibrée.";
          break;
        case '4':
          recommendation += "🚫 Aliment ultra-transformé. Limitez fortement la consommation pour préserver votre santé.";
          break;
      }
    }

    return recommendation;
  }

  // Analyser les additifs et donner des informations
  analyzeAdditives(additives) {
    if (!additives || additives.length === 0) {
      return "✅ Aucun additif détecté dans ce produit.";
    }

    let analysis = `⚠️ ${additives.length} additif(s) détecté(s) :\n`;
    
    // Analyser les premiers additifs avec plus de détails
    additives.slice(0, 5).forEach(additive => {
      const cleanAdditive = additive.replace('en:', '').toUpperCase();
      const additiveInfo = this.getAdditiveInfo(cleanAdditive);
      analysis += `• ${cleanAdditive}${additiveInfo ? ` - ${additiveInfo}` : ''}\n`;
    });

    if (additives.length > 5) {
      analysis += `... et ${additives.length - 5} autre(s)`;
    }

    analysis += "\n💡 Les additifs peuvent avoir des effets sur la santé. Privilégiez les produits avec moins d'additifs.";
    
    return analysis;
  }

  // Méthodes utilitaires pour le formatage

  // Formater un nutriment avec gestion des valeurs nulles
  formatNutrient(nutrition, key, unit) {
    const value = nutrition[key];
    if (value === undefined || value === null || value === '') {
      return 'Non disponible';
    }
    
    // Arrondir les valeurs pour une meilleure lisibilité
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return 'Non disponible';
    }
    
    if (numValue < 0.1 && numValue > 0) {
      return `< 0.1 ${unit}`;
    }
    
    return `${numValue < 10 ? numValue.toFixed(1) : Math.round(numValue)} ${unit}`;
  }

  // Obtenir les scores avec emojis
  getScoresWithEmojis(nutriscore, nova, ecoscore) {
    const nutriscoreEmoji = {
      'A': '🟢 A (Excellent)',
      'B': '🟡 B (Bon)', 
      'C': '🟠 C (Moyen)',
      'D': '🔴 D (Médiocre)',
      'E': '⚫ E (Mauvais)'
    };

    const novaEmoji = {
      '1': '🟢 Groupe 1 (Non transformés)',
      '2': '🟡 Groupe 2 (Ingrédients culinaires)',
      '3': '🟠 Groupe 3 (Transformés)',
      '4': '🔴 Groupe 4 (Ultra-transformés)'
    };

    const ecoscoreEmoji = {
      'A': '🟢 A (Très faible impact)',
      'B': '🟡 B (Faible impact)',
      'C': '🟠 C (Impact modéré)',
      'D': '🔴 D (Impact élevé)',
      'E': '⚫ E (Impact très élevé)'
    };

    return {
      nutriscore: nutriscoreEmoji[nutriscore] || 'Non évalué',
      nova: novaEmoji[nova] || 'Non évalué',
      ecoscore: ecoscore ? ecoscoreEmoji[ecoscore] || `${ecoscore} (Impact environnemental)` : null
    };
  }

  // Analyser les labels et certifications
  analyzeLabels(labelsTags) {
    if (!labelsTags || labelsTags.length === 0) {
      return null;
    }

    const importantLabels = {
      'en:organic': '🌱 Bio/Biologique',
      'en:fair-trade': '🤝 Commerce équitable',
      'en:gluten-free': '🚫 Sans gluten',
      'en:lactose-free': '🥛 Sans lactose',
      'en:vegan': '🌿 Vegan',
      'en:vegetarian': '🥬 Végétarien',
      'en:palm-oil-free': '🌴 Sans huile de palme',
      'en:no-additives': '✅ Sans additifs',
      'en:natural': '🍃 Naturel',
      'en:kosher': '✡️ Casher',
      'en:halal': '☪️ Halal'
    };

    const foundLabels = labelsTags
      .filter(label => importantLabels[label])
      .map(label => importantLabels[label]);

    if (foundLabels.length === 0) {
      return null;
    }

    return foundLabels.join('\n');
  }

  // Analyser les allergènes
  analyzeAllergens(allergensTags) {
    if (!allergensTags || allergensTags.length === 0) {
      return null;
    }

    const allergenNames = {
      'en:gluten': '🌾 Gluten',
      'en:milk': '🥛 Lait',
      'en:eggs': '🥚 Œufs',
      'en:nuts': '🥜 Fruits à coque',
      'en:peanuts': '🥜 Arachides',
      'en:soybeans': '🌱 Soja',
      'en:fish': '🐟 Poisson',
      'en:crustaceans': '🦐 Crustacés',
      'en:molluscs': '🐚 Mollusques',
      'en:sesame-seeds': '🌰 Graines de sésame',
      'en:sulphur-dioxide-and-sulphites': '⚠️ Sulfites',
      'en:celery': '🥬 Céleri',
      'en:mustard': '🌶️ Moutarde',
      'en:lupin': '🌸 Lupin'
    };

    const foundAllergens = allergensTags
      .filter(allergen => allergenNames[allergen])
      .map(allergen => allergenNames[allergen]);

    if (foundAllergens.length === 0) {
      return 'Aucun allergène majeur identifié';
    }

    return foundAllergens.join('\n');
  }

  // Analyser l'origine et la fabrication
  analyzeOrigin(product) {
    const parts = [];

    if (product.origins) {
      parts.push(`🌍 Origine: ${product.origins}`);
    }

    if (product.manufacturing_places) {
      parts.push(`🏭 Lieu de fabrication: ${product.manufacturing_places}`);
    }

    if (product.countries_tags && product.countries_tags.length > 0) {
      const countries = product.countries_tags
        .map(country => country.replace('en:', '').replace('-', ' '))
        .join(', ');
      parts.push(`🗺️ Pays: ${countries}`);
    }

    if (product.stores) {
      parts.push(`🏪 Magasins: ${product.stores}`);
    }

    return parts.length > 0 ? parts.join('\n') : null;
  }

  // Obtenir les informations de portion
  getServingInfo(product) {
    const parts = [];

    if (product.serving_size) {
      parts.push(`📏 Taille de portion: ${product.serving_size}`);
    }

    if (product.packaging) {
      parts.push(`📦 Emballage: ${product.packaging}`);
    }

    return parts.length > 0 ? parts.join('\n') : null;
  }

  // Formater les catégories
  formatCategories(categories) {
    if (!categories) {
      return null;
    }

    // Prendre les 3 premières catégories principales
    const categoryList = categories.split(',').slice(0, 3);
    return categoryList.map(cat => `• ${cat.trim()}`).join('\n');
  }

  // Obtenir des informations sur un additif spécifique
  getAdditiveInfo(additive) {
    const additiveInfo = {
      'E100': 'Curcumine (colorant jaune)',
      'E101': 'Riboflavine (colorant jaune)',
      'E102': 'Tartrazine (colorant jaune)',
      'E110': 'Jaune orangé S (colorant)',
      'E120': 'Cochenille (colorant rouge)',
      'E150A': 'Caramel (colorant)',
      'E160A': 'Carotènes (colorant orange)',
      'E200': 'Acide sorbique (conservateur)',
      'E202': 'Sorbate de potassium (conservateur)',
      'E211': 'Benzoate de sodium (conservateur)',
      'E220': 'Dioxyde de soufre (conservateur)',
      'E250': 'Nitrite de sodium (conservateur)',
      'E300': 'Acide ascorbique (antioxydant)',
      'E322': 'Lécithines (émulsifiant)',
      'E330': 'Acide citrique (acidifiant)',
      'E407': 'Carraghénanes (épaississant)',
      'E412': 'Gomme de guar (épaississant)',
      'E415': 'Gomme xanthane (épaississant)',
      'E440': 'Pectines (gélifiant)',
      'E471': 'Mono- et diglycérides (émulsifiant)',
      'E500': 'Carbonates de sodium (régulateur)',
      'E621': 'Glutamate monosodique (exhausteur)'
    };

    return additiveInfo[additive] || null;
  }

  // Améliorer les recommandations nutritionnelles
  getNutritionalRecommendation(nutriscoreGrade, novaGroup, product) {
    let recommendation = "";
    
    // Recommandations basées sur le Nutri-Score
    switch (nutriscoreGrade?.toUpperCase()) {
      case 'A':
        recommendation += "✅ **EXCELLENT CHOIX !** Ce produit a un profil nutritionnel optimal. Vous pouvez le consommer régulièrement dans le cadre d'une alimentation équilibrée.";
        break;
      case 'B':
        recommendation += "👍 **BON CHOIX !** Ce produit a une bonne qualité nutritionnelle. Il peut faire partie d'une alimentation saine.";
        break;
      case 'C':
        recommendation += "⚠️ **QUALITÉ MOYENNE.** Ce produit peut être consommé occasionnellement. Privilégiez les alternatives avec de meilleurs scores.";
        break;
      case 'D':
        recommendation += "🔶 **QUALITÉ MÉDIOCRE.** Limitez la consommation de ce produit. Recherchez des alternatives plus saines.";
        break;
      case 'E':
        recommendation += "❌ **ÉVITEZ CE PRODUIT.** Très mauvaise qualité nutritionnelle. Consommez très occasionnellement ou trouvez une alternative.";
        break;
      default:
        recommendation += "ℹ️ Nutri-Score non disponible pour ce produit.";
    }

    // Recommandations basées sur NOVA
    if (novaGroup) {
      recommendation += "\n\n";
      switch (novaGroup.toString()) {
        case '1':
          recommendation += "🌱 **ALIMENT NATUREL** - Non transformé ou minimalement transformé. Parfait pour une alimentation saine !";
          break;
        case '2':
          recommendation += "🧂 **INGRÉDIENT CULINAIRE** - Utilisez avec modération pour cuisiner et assaisonner.";
          break;
        case '3':
          recommendation += "⚠️ **ALIMENT TRANSFORMÉ** - Consommez occasionnellement. Préférez les aliments moins transformés.";
          break;
        case '4':
          recommendation += "🚫 **ULTRA-TRANSFORMÉ** - Évitez autant que possible. Ces produits sont liés à des risques pour la santé.";
          break;
      }
    }

    // Recommandations spécifiques basées sur les nutriments
    const nutrition = product.nutriments || {};
    const additionalTips = [];

    if (nutrition['salt_100g'] && nutrition['salt_100g'] > 1.5) {
      additionalTips.push("🧂 **Attention:** Taux de sel élevé. Limitez si vous surveillez votre consommation de sodium.");
    }

    if (nutrition['sugars_100g'] && nutrition['sugars_100g'] > 15) {
      additionalTips.push("🍯 **Attention:** Riche en sucres. À consommer avec modération.");
    }

    if (nutrition['saturated-fat_100g'] && nutrition['saturated-fat_100g'] > 5) {
      additionalTips.push("🔴 **Attention:** Riche en graisses saturées. Limitez la consommation.");
    }

    if (nutrition['fiber_100g'] && nutrition['fiber_100g'] > 6) {
      additionalTips.push("🌾 **Bon point:** Riche en fibres, bénéfique pour la digestion.");
    }

    if (additionalTips.length > 0) {
      recommendation += "\n\n" + additionalTips.join("\n");
    }

    return recommendation;
  }
}

module.exports = new FoodService();