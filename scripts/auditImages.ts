/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  ShopDigital · Script de Auditoría de Imágenes Legacy                  ║
 * ║  Escanea Firestore y lista todos los assets PNG/JPG a migrar            ║
 * ║                                                                          ║
 * ║  Uso:                                                                    ║
 * ║    npx tsx scripts/auditImages.ts                                       ║
 * ║                                                                          ║
 * ║  Salida:                                                                 ║
 * ║    - Tabla en consola con cada imagen legacy encontrada                 ║
 * ║    - Archivo audit_images_report.json en la raíz del proyecto           ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// Configuración Firebase — lee del .env.local o variables de entorno
// ─────────────────────────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey:            process.env.VITE_FIREBASE_API_KEY            || '',
  authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN        || '',
  projectId:         process.env.VITE_FIREBASE_PROJECT_ID         || '',
  storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET     || '',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId:             process.env.VITE_FIREBASE_APP_ID             || '',
};

// ─────────────────────────────────────────────────────────────────────────────
// Tipos de resultado
// ─────────────────────────────────────────────────────────────────────────────

type ImageFormat = 'webp' | 'png' | 'jpg' | 'jpeg' | 'base64-legacy' | 'external' | 'unknown';
type ImageContext = 'bannerImage' | 'image' | 'photo' | 'offer_image' | 'novedades';
type MigrationPriority = 'ALTA' | 'MEDIA' | 'BAJA';

interface LegacyImageEntry {
  collection: string;
  townId: string;
  docId: string;
  docName: string;
  field: ImageContext;
  url: string;
  format: ImageFormat;
  sizeEstimateKB: string;
  priority: MigrationPriority;
  action: string;
}

interface AuditReport {
  generatedAt: string;
  totalDocumentsScanned: number;
  totalLegacyImages: number;
  byFormat: Record<string, number>;
  byCollection: Record<string, number>;
  entries: LegacyImageEntry[];
  recommendations: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Detección de formato
// ─────────────────────────────────────────────────────────────────────────────

function detectFormat(url: string): ImageFormat {
  if (!url || typeof url !== 'string') return 'unknown';
  if (url.startsWith('data:image/webp')) return 'webp';
  if (url.startsWith('data:image/png')) return 'png';
  if (url.startsWith('data:image/jpeg') || url.startsWith('data:image/jpg')) return 'jpeg';
  if (url.startsWith('data:image/')) return 'base64-legacy';
  const lower = url.toLowerCase();
  if (lower.includes('.webp')) return 'webp';
  if (lower.includes('.png')) return 'png';
  if (lower.includes('.jpg') || lower.includes('.jpeg')) return 'jpg';
  if (lower.startsWith('http') || lower.startsWith('//')) return 'external';
  return 'unknown';
}

function isLegacy(format: ImageFormat): boolean {
  return ['png', 'jpg', 'jpeg', 'base64-legacy'].includes(format);
}

function estimateBase64SizeKB(base64: string): string {
  if (!base64.startsWith('data:')) return 'N/A (URL externa)';
  const b64Data = base64.split(',')[1] || '';
  const sizeBytes = (b64Data.length * 3) / 4;
  return `~${Math.round(sizeBytes / 1024)} kB`;
}

function getPriority(format: ImageFormat, field: ImageContext): MigrationPriority {
  if (field === 'bannerImage' || field === 'image') return 'ALTA';
  if (format === 'png') return 'ALTA'; // PNG sin comprimir = máxima prioridad
  if (field === 'offer_image') return 'MEDIA';
  return 'BAJA';
}

function getAction(format: ImageFormat): string {
  if (format === 'png') return 'Convertir a WebP (mayor ahorro)';
  if (format === 'jpg' || format === 'jpeg') return 'Re-comprimir como WebP al 80%';
  if (format === 'base64-legacy') return 'Re-procesar con imageProcessor y re-subir a Firebase Storage';
  if (format === 'external') return 'Revisar si es controlable (Unsplash etc.)';
  return 'Investigar manualmente';
}

// ─────────────────────────────────────────────────────────────────────────────
// Funciones de extracción de campos de imagen por colección
// ─────────────────────────────────────────────────────────────────────────────

function extractImageFields(doc: Record<string, unknown>, docId: string): Array<{ field: ImageContext; url: string }> {
  const result: Array<{ field: ImageContext; url: string }> = [];

  // Campos directos de comercios
  const directFields: ImageContext[] = ['bannerImage', 'image', 'photo'];
  for (const field of directFields) {
    const val = doc[field];
    if (val && typeof val === 'string' && val.length > 10) {
      result.push({ field, url: val });
    }
  }

  // Imágenes de ofertas embebidas en el array offers[]
  const offers = doc['offers'];
  if (Array.isArray(offers)) {
    for (const offer of offers) {
      if (offer && typeof offer === 'object') {
        const imgVal = (offer as Record<string, unknown>)['image'];
        if (imgVal && typeof imgVal === 'string' && imgVal.length > 10) {
          result.push({ field: 'offer_image', url: imgVal as string });
        }
      }
    }
  }

  // Imágenes de novedades (muro de fotos)
  const novedades = doc['novedades'];
  if (Array.isArray(novedades)) {
    for (const item of novedades) {
      if (item && typeof item === 'object') {
        const imgVal = (item as Record<string, unknown>)['image'] || (item as Record<string, unknown>)['photo'];
        if (imgVal && typeof imgVal === 'string' && imgVal.length > 10) {
          result.push({ field: 'novedades', url: imgVal as string });
        }
      }
    }
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Script principal
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║  ShopDigital · Image Audit Script v2.0               ║');
  console.log('║  Iniciando escaneo de colecciones Firestore...        ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  if (!firebaseConfig.projectId) {
    console.error('❌ ERROR: Variables de entorno Firebase no configuradas.');
    console.error('   Asegurate de tener VITE_FIREBASE_PROJECT_ID en tu entorno.');
    console.error('   Ejecutá: $env:VITE_FIREBASE_PROJECT_ID="tu-project-id" antes del script.');
    process.exit(1);
  }

  // Inicializar Firebase
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  const db = getFirestore(app);

  const legacyEntries: LegacyImageEntry[] = [];
  const formatCounts: Record<string, number> = {};
  const collectionCounts: Record<string, number> = {};
  let totalDocs = 0;

  // ── Colecciones a auditar ────────────────────────────────────────────────
  // ShopDigital usa colecciones dinámicas por townId bajo 'ciudades/{townId}/comercios'
  // También hay una colección raíz 'comercios' legada.

  const COLLECTIONS_TO_AUDIT = [
    'comercios',          // Colección raíz legada
    'ofertas',            // Ofertas globales
  ];

  // Escanear colecciones raíz
  for (const colName of COLLECTIONS_TO_AUDIT) {
    try {
      console.log(`📂 Escaneando colección: ${colName}...`);
      const snap = await getDocs(collection(db, colName));
      
      for (const docSnap of snap.docs) {
        totalDocs++;
        const data = docSnap.data() as Record<string, unknown>;
        const townId = (data['townId'] as string) || 'global';
        const name = (data['name'] as string) || docSnap.id;
        const fields = extractImageFields(data, docSnap.id);

        for (const { field, url } of fields) {
          const format = detectFormat(url);
          formatCounts[format] = (formatCounts[format] || 0) + 1;

          if (isLegacy(format)) {
            collectionCounts[colName] = (collectionCounts[colName] || 0) + 1;
            legacyEntries.push({
              collection: colName,
              townId,
              docId: docSnap.id,
              docName: name,
              field,
              url: url.startsWith('data:') ? url.substring(0, 80) + '...[base64 truncado]' : url,
              format,
              sizeEstimateKB: estimateBase64SizeKB(url),
              priority: getPriority(format, field),
              action: getAction(format),
            });
          }
        }
      }
    } catch (err) {
      console.warn(`⚠️  No se pudo leer ${colName}:`, (err as Error).message);
    }
  }

  // ── Colección dinámica 'ciudades' → escanear todas las sub-colecciones ──
  try {
    console.log(`📂 Escaneando ciudades/{townId}/comercios...`);
    const ciudadesSnap = await getDocs(collection(db, 'ciudades'));
    
    for (const ciudadDoc of ciudadesSnap.docs) {
      const townId = ciudadDoc.id;
      try {
        const comerciosSnap = await getDocs(collection(db, `ciudades/${townId}/comercios`));
        for (const comercioDoc of comerciosSnap.docs) {
          totalDocs++;
          const data = comercioDoc.data() as Record<string, unknown>;
          const name = (data['name'] as string) || comercioDoc.id;
          const colKey = `ciudades/${townId}/comercios`;
          const fields = extractImageFields(data, comercioDoc.id);

          for (const { field, url } of fields) {
            const format = detectFormat(url);
            formatCounts[format] = (formatCounts[format] || 0) + 1;

            if (isLegacy(format)) {
              collectionCounts[colKey] = (collectionCounts[colKey] || 0) + 1;
              legacyEntries.push({
                collection: colKey,
                townId,
                docId: comercioDoc.id,
                docName: name,
                field,
                url: url.startsWith('data:') ? url.substring(0, 80) + '...[base64 truncado]' : url,
                format,
                sizeEstimateKB: estimateBase64SizeKB(url),
                priority: getPriority(format, field),
                action: getAction(format),
              });
            }
          }
        }
      } catch {
        // Subcolección vacía o inexistente — ignorar silenciosamente
      }
    }
  } catch (err) {
    console.warn('⚠️  No se pudo acceder a ciudades/', (err as Error).message);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Generar reporte
  // ─────────────────────────────────────────────────────────────────────────

  const report: AuditReport = {
    generatedAt: new Date().toISOString(),
    totalDocumentsScanned: totalDocs,
    totalLegacyImages: legacyEntries.length,
    byFormat: formatCounts,
    byCollection: collectionCounts,
    entries: legacyEntries.sort((a, b) => {
      const priorityOrder = { ALTA: 0, MEDIA: 1, BAJA: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }),
    recommendations: [
      '1. Prioridad ALTA: Re-procesar bannerImage y image con processImageToDataUrl("banner") → reducción estimada 60-80%',
      '2. Imágenes PNG: Migrarlas primero, son las más pesadas sin compresión',
      '3. Base64 embebidas en Firestore: Subir a Firebase Storage con processImageToBlob() y guardar la URL en su lugar',
      '4. URLs externas (Unsplash): Opcionalmente cachear en Storage para control total',
      '5. Ejecutar este script semanalmente hasta que totalLegacyImages = 0',
    ],
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Salida en consola
  // ─────────────────────────────────────────────────────────────────────────

  console.log('\n══════════════════════════════════════════════════════');
  console.log('📊 RESUMEN DEL ESCANEO');
  console.log('══════════════════════════════════════════════════════');
  console.log(`  Documentos escaneados: ${totalDocs}`);
  console.log(`  Imágenes legacy (PNG/JPG): ${legacyEntries.length}`);
  console.log(`  Distribución por formato: ${JSON.stringify(formatCounts)}`);
  console.log(`\n  Imágenes legacy por colección:`);
  Object.entries(collectionCounts).forEach(([col, count]) => {
    console.log(`    • ${col}: ${count} imágenes`);
  });

  if (legacyEntries.length === 0) {
    console.log('\n✅ ¡Excelente! No se encontraron imágenes legacy. Todas están en WebP.');
  } else {
    console.log('\n⚠️  IMÁGENES LEGACY ENCONTRADAS — ACCIÓN REQUERIDA:\n');
    const highPriority = legacyEntries.filter(e => e.priority === 'ALTA');
    const medPriority  = legacyEntries.filter(e => e.priority === 'MEDIA');
    
    if (highPriority.length > 0) {
      console.log(`  🔴 ALTA prioridad (${highPriority.length}):`);
      highPriority.slice(0, 10).forEach(e => {
        console.log(`     [${e.townId}] ${e.docName} → campo "${e.field}" → ${e.format.toUpperCase()} (${e.sizeEstimateKB})`);
      });
      if (highPriority.length > 10) console.log(`     ... y ${highPriority.length - 10} más (ver JSON)`);
    }
    
    if (medPriority.length > 0) {
      console.log(`  🟡 MEDIA prioridad (${medPriority.length}):`);
      medPriority.slice(0, 5).forEach(e => {
        console.log(`     [${e.townId}] ${e.docName} → campo "${e.field}" → ${e.format.toUpperCase()} (${e.sizeEstimateKB})`);
      });
    }
  }

  console.log('\n📋 Recomendaciones:');
  report.recommendations.forEach(r => console.log(`  ${r}`));

  // ─────────────────────────────────────────────────────────────────────────
  // Guardar JSON
  // ─────────────────────────────────────────────────────────────────────────

  const outputPath = path.resolve('./audit_images_report.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n💾 Reporte completo guardado en: ${outputPath}`);
  console.log('══════════════════════════════════════════════════════\n');
  
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Error fatal en el script de auditoría:', err);
  process.exit(1);
});
