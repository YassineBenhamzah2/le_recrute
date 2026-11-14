import fs from 'fs';
import zlib from 'zlib';

/**
 * Extracteur natif de texte depuis un fichier PDF (sans dépendances externes)
 * Décompresse les streams FlateDecode et extrait les chaînes de texte PDF.
 */
export const extractTextFromPDF = (filePath) => {
  if (!filePath || !fs.existsSync(filePath)) {
    return '';
  }

  try {
    const buffer = fs.readFileSync(filePath);
    const latinStr = buffer.toString('latin1');
    let extractedText = '';

    // 1. Recherche et décompression des blocs "stream ... endstream"
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let match;

    while ((match = streamRegex.exec(latinStr)) !== null) {
      try {
        const streamRaw = Buffer.from(match[1], 'latin1');
        let decompressed;
        try {
          decompressed = zlib.inflateSync(streamRaw).toString('latin1');
        } catch {
          try {
            decompressed = zlib.inflateRawSync(streamRaw).toString('latin1');
          } catch {
            decompressed = '';
          }
        }

        if (decompressed) {
          // Extraire les textes entre parenthèses (...) utilisés par les commandes Tj / TJ
          const textMatches = decompressed.match(/\(([^)]+)\)/g);
          if (textMatches) {
            extractedText += ' ' + textMatches.map((s) => s.slice(1, -1)).join(' ');
          }
        }
      } catch (err) {
        // Ignorer les streams d'images ou non-zlib
      }
    }

    // 2. Extraire également le texte brut présent hors stream
    const rawMatches = latinStr.match(/\(([^)]{2,})\)/g);
    if (rawMatches) {
      extractedText += ' ' + rawMatches.map((s) => s.slice(1, -1)).join(' ');
    }

    return extractedText.replace(/\s+/g, ' ').trim();
  } catch (err) {
    console.warn(`Erreur extraction PDF (${filePath}):`, err.message);
    return '';
  }
};

export default extractTextFromPDF;
