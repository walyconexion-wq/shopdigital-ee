const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// High-quality Unsplash images per category
const CATEGORY_IMAGES = {
  pizzerias: [
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80',
    'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600&q=80',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80',
    'https://images.unsplash.com/photo-1555072956-7758afb20a8f?w=600&q=80',
    'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&q=80',
    'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&q=80',
    'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=600&q=80'
  ],
  restaurantes: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&q=80',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80'
  ],
  fastfood: [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80',
    'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&q=80',
    'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&q=80',
    'https://images.unsplash.com/photo-1534790100865-e658ad6753cf?w=600&q=80',
    'https://images.unsplash.com/photo-1521305916504-4a1121188589?w=600&q=80',
    'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&q=80'
  ],
  beer: [
    'https://images.unsplash.com/photo-1532635241-17e820add50f?w=600&q=80',
    'https://images.unsplash.com/photo-1471421298428-1513ab720a8e?w=600&q=80',
    'https://images.unsplash.com/photo-1518099074172-2e47ee7cfdf0?w=600&q=80',
    'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=600&q=80',
    'https://images.unsplash.com/photo-1584225065152-4a1454aa3d4e?w=600&q=80',
    'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600&q=80'
  ],
  icecream: [
    'https://images.unsplash.com/photo-1567206563066-0480d07addb6?w=600&q=80',
    'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&q=80',
    'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600&q=80',
    'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?w=600&q=80',
    'https://images.unsplash.com/photo-1534706936960-85aa60f45a60?w=600&q=80',
    'https://images.unsplash.com/photo-1505394033-f3e031e4526d?w=600&q=80'
  ],
  gastro: [ // Cafeterías y Panaderías
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',
    'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&q=80',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80',
    'https://images.unsplash.com/photo-1447078806655-40579c2520d6?w=600&q=80'
  ],
  markets: [
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80',
    'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&q=80',
    'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&q=80',
    'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=600&q=80',
    'https://images.unsplash.com/photo-1583258292688-d0213df4a3a8?w=600&q=80',
    'https://images.unsplash.com/photo-1488459718432-010c5669a13d?w=600&q=80'
  ],
  fashion: [
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80',
    'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600&q=80',
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80',
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=80'
  ],
  hair: [ // Peluquerías
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80',
    'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?w=600&q=80',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80',
    'https://images.unsplash.com/photo-1598252948168-a89574043aee?w=600&q=80',
    'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80',
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&q=80'
  ],
  gym: [
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
    'https://images.unsplash.com/photo-1571731956672-f2b94d7db0cb?w=600&q=80',
    'https://images.unsplash.com/photo-1584735935682-2f2b66dff9d2?w=600&q=80',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80'
  ],
  hardware: [ // Ferreterías
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80',
    'https://images.unsplash.com/photo-1530124560072-aee70c1859d0?w=600&q=80',
    'https://images.unsplash.com/photo-1508962914676-134849a727f0?w=600&q=80',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80',
    'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=600&q=80',
    'https://images.unsplash.com/photo-1540206395-68808572332f?w=600&q=80'
  ],
  pets: [ // Veterinarias
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&q=80',
    'https://images.unsplash.com/photo-1581888227599-779811939961?w=600&q=80',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80',
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80',
    'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=600&q=80',
    'https://images.unsplash.com/photo-1535268647977-a403b69fc756?w=600&q=80'
  ],
  beauty: [ // Estéticas
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
    'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80',
    'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&q=80',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
    'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&q=80',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80'
  ],
  farmacias: [
    'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&q=80',
    'https://images.unsplash.com/photo-1607619056574-7b8d304a2c23?w=600&q=80',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
    'https://images.unsplash.com/photo-1587854692152-cbe660db097d?w=600&q=80',
    'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=600&q=80',
    'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=600&q=80'
  ],
  auto: [ // Lubricentros y Talleres
    'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&q=80',
    'https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=600&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80',
    'https://images.unsplash.com/photo-1530047625168-4b18dfaadaa1?w=600&q=80',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80',
    'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=600&q=80'
  ],
  tech: [
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80',
    'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&q=80',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80',
    'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&q=80',
    'https://images.unsplash.com/photo-1504274066651-8d31a536b11a?w=600&q=80'
  ]
};

// Deterministic hashing helper
function getDeterministicImage(categoryId, shopId) {
  const images = CATEGORY_IMAGES[categoryId];
  if (!images || images.length === 0) return null;
  let hash = 0;
  for (let i = 0; i < shopId.length; i++) {
    hash = shopId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % images.length;
  return images[index];
}

async function run() {
  console.log('🔄 Iniciando actualización de imágenes de comercios en Firestore...');
  const snapshot = await db.collection('comercios').get();
  console.log(`🏪 Se encontraron ${snapshot.size} comercios en total.`);

  let updatedCount = 0;
  let skippedCount = 0;
  
  // Use a batch to write efficiently
  let batch = db.batch();
  let operationCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const categoryId = data.categoryId || data.category;
    const shopId = doc.id;

    if (categoryId && CATEGORY_IMAGES[categoryId]) {
      const selectedImg = getDeterministicImage(categoryId, shopId);
      
      if (selectedImg && (data.bannerImage !== selectedImg || data.image !== selectedImg)) {
        const docRef = db.collection('comercios').doc(shopId);
        batch.update(docRef, {
          bannerImage: selectedImg,
          image: selectedImg
        });
        
        updatedCount++;
        operationCount++;

        // Batch limit is 500 operations in Firestore
        if (operationCount >= 450) {
          console.log(`💾 Confirmando lote de ${operationCount} actualizaciones...`);
          await batch.commit();
          batch = db.batch();
          operationCount = 0;
        }
      } else {
        skippedCount++;
      }
    } else {
      skippedCount++;
    }
  }

  if (operationCount > 0) {
    console.log(`💾 Confirmando lote final de ${operationCount} actualizaciones...`);
    await batch.commit();
  }

  console.log('\n🎉 ¡PROCESO DE MIGRACIÓN COMPLETADO!');
  console.log(`✅ Comercios actualizados: ${updatedCount}`);
  console.log(`⏭️ Comercios omitidos: ${skippedCount}`);
}

run().catch(console.error);
