const axios = require('axios');

async function testOpenFoodFactsAPI() {
  console.log('🔍 Test de l\'API OpenFoodFacts...\n');

  // Test 1: Produit par code-barres (Nutella)
  try {
    console.log('📦 Test 1: Recherche par code-barres (Nutella - 3017620422003)');
    const response1 = await axios.get('https://world.openfoodfacts.org/api/v2/product/3017620422003.json');
    
    if (response1.data.status === 1) {
      const product = response1.data.product;
      console.log('✅ Produit trouvé:');
      console.log(`   Nom: ${product.product_name}`);
      console.log(`   Marque: ${product.brands}`);
      console.log(`   Nutri-Score: ${product.nutriscore_grade}`);
      console.log(`   NOVA: ${product.nova_group}`);
      console.log(`   Catégories: ${product.categories}`);
      
      // Analyser les nutriments disponibles
      console.log('\n🥗 Nutriments disponibles:');
      const nutrients = product.nutriments || {};
      Object.keys(nutrients).filter(key => key.includes('100g')).slice(0, 10).forEach(key => {
        console.log(`   ${key}: ${nutrients[key]}`);
      });
      
      // Analyser les additifs
      console.log('\n🧬 Additifs:');
      if (product.additives_tags) {
        console.log(`   Nombre: ${product.additives_tags.length}`);
        product.additives_tags.slice(0, 5).forEach(additive => {
          console.log(`   - ${additive}`);
        });
      }
      
      // Analyser les allergènes
      console.log('\n⚠️ Allergènes:');
      if (product.allergens_tags) {
        product.allergens_tags.forEach(allergen => {
          console.log(`   - ${allergen}`);
        });
      }
      
      // Analyser les ingrédients
      console.log('\n🧪 Ingrédients:');
      console.log(`   Texte: ${product.ingredients_text ? product.ingredients_text.substring(0, 100) + '...' : 'Non disponible'}`);
      
      // Analyser les labels
      console.log('\n🏷️ Labels:');
      if (product.labels_tags) {
        product.labels_tags.slice(0, 5).forEach(label => {
          console.log(`   - ${label}`);
        });
      }
      
    } else {
      console.log('❌ Produit non trouvé');
    }
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Recherche par nom
  try {
    console.log('🔍 Test 2: Recherche par nom (coca cola)');
    const response2 = await axios.get('https://world.openfoodfacts.org/cgi/search.pl', {
      params: {
        search_terms: 'coca cola',
        search_simple: 1,
        action: 'process',
        json: 1,
        page_size: 3,
        fields: 'product_name,brands,nutriscore_grade,nova_group,code,nutriments,categories,labels_tags'
      }
    });
    
    if (response2.data.products && response2.data.products.length > 0) {
      console.log(`✅ ${response2.data.products.length} produits trouvés:`);
      response2.data.products.forEach((product, index) => {
        console.log(`\n   ${index + 1}. ${product.product_name || 'Nom non disponible'}`);
        console.log(`      Marque: ${product.brands || 'Non disponible'}`);
        console.log(`      Code: ${product.code || 'Non disponible'}`);
        console.log(`      Nutri-Score: ${product.nutriscore_grade || 'Non disponible'}`);
        console.log(`      NOVA: ${product.nova_group || 'Non disponible'}`);
      });
    } else {
      console.log('❌ Aucun produit trouvé');
    }
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Recherche par catégorie
  try {
    console.log('🍫 Test 3: Recherche par catégorie (chocolates)');
    const response3 = await axios.get('https://world.openfoodfacts.org/cgi/search.pl', {
      params: {
        tagtype_0: 'categories',
        tag_contains_0: 'contains',
        tag_0: 'chocolates',
        action: 'process',
        json: 1,
        page_size: 3,
        fields: 'product_name,brands,nutriscore_grade,nova_group,code'
      }
    });
    
    if (response3.data.products && response3.data.products.length > 0) {
      console.log(`✅ ${response3.data.products.length} produits trouvés:`);
      response3.data.products.forEach((product, index) => {
        console.log(`\n   ${index + 1}. ${product.product_name || 'Nom non disponible'}`);
        console.log(`      Marque: ${product.brands || 'Non disponible'}`);
        console.log(`      Code: ${product.code || 'Non disponible'}`);
      });
    } else {
      console.log('❌ Aucun produit trouvé');
    }
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`);
  }
}

testOpenFoodFactsAPI().catch(console.error);