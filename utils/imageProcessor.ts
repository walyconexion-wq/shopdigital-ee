/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  ShopDigital · Image Processor Pipeline                         ║
 * ║  Compresión WebP en cliente — sin dependencias externas          ║
 * ║  Versión: 2.0 · No añade overhead al critical path              ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Uso:
 *   import { processImage, ImageProfile } from '../utils/imageProcessor';
 *
 *   const result = await processImage(file, 'banner');
 *   // result.blob  → Blob WebP listo para uploadBytes()
 *   // result.dataUrl → string base64 WebP para previews
 *   // result.filename → nombre sugerido con extensión .webp
 *   // result.stats → { originalKB, finalKB, reductionPct }
 */

// ─────────────────────────────────────────────────────────────────────────────
// Perfiles de compresión por contexto
// ─────────────────────────────────────────────────────────────────────────────

export type ImageProfile =
  | 'banner'      // Portadas de catálogo: max 800px, calidad 80%
  | 'offer'       // Imágenes de ofertas: max 600px, calidad 80%
  | 'thumbnail'   // Miniaturas (logos, avatares): max 400px, calidad 75%
  | 'bunker'      // Archivos del búnker: max 1200px, calidad 85%
  | 'enterprise'; // Logotipos empresariales: max 800px, calidad 85%

interface ProfileConfig {
  maxDim: number;
  quality: number;
}

const PROFILES: Record<ImageProfile, ProfileConfig> = {
  banner:     { maxDim: 800,  quality: 0.80 },
  offer:      { maxDim: 600,  quality: 0.80 },
  thumbnail:  { maxDim: 400,  quality: 0.75 },
  bunker:     { maxDim: 1200, quality: 0.85 },
  enterprise: { maxDim: 800,  quality: 0.85 },
};

// ─────────────────────────────────────────────────────────────────────────────
// Resultado del procesamiento
// ─────────────────────────────────────────────────────────────────────────────

export interface ProcessedImage {
  blob: Blob;
  dataUrl: string;
  filename: string;
  mimeType: 'image/webp';
  stats: {
    originalKB: number;
    finalKB: number;
    reductionPct: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Verificación de soporte WebP en el navegador
// ─────────────────────────────────────────────────────────────────────────────

let _webpSupported: boolean | null = null;

function checkWebPSupport(): boolean {
  if (_webpSupported !== null) return _webpSupported;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  _webpSupported = canvas.toDataURL('image/webp').startsWith('data:image/webp');
  return _webpSupported;
}

// ─────────────────────────────────────────────────────────────────────────────
// Función principal — convierte File a WebP comprimido
// ─────────────────────────────────────────────────────────────────────────────

export async function processImage(
  file: File,
  profile: ImageProfile = 'banner'
): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo no es una imagen válida.'));
      return;
    }

    const { maxDim, quality } = PROFILES[profile];
    const webpSupported = checkWebPSupport();
    // Si WebP no está soportado (edge case iOS antiguo), usamos JPEG como fallback
    const outputMime = webpSupported ? 'image/webp' : 'image/jpeg';
    const originalKB = Math.round(file.size / 1024);

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // ── 1. Calcular dimensiones respetando aspect-ratio ────────────────
        let { width, height } = img;

        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        // ── 2. Dibujar en canvas ────────────────────────────────────────────
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context no disponible.'));
          return;
        }

        // Fondo blanco para imágenes con transparencia (PNG→WebP)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // ── 3. Extraer como Blob WebP ──────────────────────────────────────
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('No se pudo convertir la imagen.'));
              return;
            }

            const finalKB = Math.round(blob.size / 1024);
            const reductionPct = Math.round(((originalKB - finalKB) / originalKB) * 100);

            // ── 4. Generar dataUrl para preview inmediato ──────────────────
            const dataUrl = canvas.toDataURL(outputMime, quality);

            // ── 5. Nombre de archivo con extensión .webp ──────────────────
            const baseName = file.name.replace(/\.[^/.]+$/, '');
            const ext = webpSupported ? 'webp' : 'jpg';
            const filename = `${baseName}.${ext}`;

            resolve({
              blob,
              dataUrl,
              filename,
              mimeType: 'image/webp',
              stats: { originalKB, finalKB, reductionPct },
            });
          },
          outputMime,
          quality
        );
      };

      img.onerror = () => reject(new Error('Error al cargar la imagen.'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Error al leer el archivo.'));
    reader.readAsDataURL(file);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper de conveniencia — devuelve sólo el dataUrl (para previews rápidas)
// ─────────────────────────────────────────────────────────────────────────────

export async function processImageToDataUrl(
  file: File,
  profile: ImageProfile = 'banner'
): Promise<string> {
  const result = await processImage(file, profile);
  return result.dataUrl;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper de conveniencia — devuelve Blob para uploadBytes() de Firebase Storage
// ─────────────────────────────────────────────────────────────────────────────

export async function processImageToBlob(
  file: File,
  profile: ImageProfile = 'banner'
): Promise<{ blob: Blob; filename: string }> {
  const result = await processImage(file, profile);
  return { blob: result.blob, filename: result.filename };
}

// ─────────────────────────────────────────────────────────────────────────────
// Detección de formato legacy — para el script de auditoría
// ─────────────────────────────────────────────────────────────────────────────

export function isLegacyFormat(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.includes('.png') ||
    lower.includes('.jpg') ||
    lower.includes('.jpeg') ||
    lower.includes('format=png') ||
    lower.includes('format=jpg') ||
    // Firebase Storage URLs con parámetros de imagen legacy
    (lower.includes('firebasestorage.googleapis.com') && !lower.includes('.webp'))
  );
}

export function getImageFormat(
  url: string
): 'webp' | 'png' | 'jpg' | 'jpeg' | 'base64' | 'external' | 'unknown' {
  if (url.startsWith('data:image/webp')) return 'webp';
  if (url.startsWith('data:image/png')) return 'png';
  if (url.startsWith('data:image/jpeg') || url.startsWith('data:image/jpg')) return 'jpeg';
  if (url.startsWith('data:image/')) return 'base64';
  const lower = url.toLowerCase();
  if (lower.includes('.webp')) return 'webp';
  if (lower.includes('.png')) return 'png';
  if (lower.includes('.jpg') || lower.includes('.jpeg')) return 'jpg';
  if (lower.startsWith('http')) return 'external';
  return 'unknown';
}
