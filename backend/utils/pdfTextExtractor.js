import fs from 'fs';
import zlib from 'zlib';

/**
 * Décodeur ASCII85 (Adobe Base85) pour les streams PDF ReportLab / Adobe
 */
function decodeAscii85(str) {
  let clean = str.replace(/<~|~>/g, '').replace(/\s+/g, '');
  let out = [];
  let i = 0;
  while (i < clean.length) {
    if (clean[i] === 'z') {
      out.push(0, 0, 0, 0);
      i++;
      continue;
    }
    let chunk = clean.slice(i, i + 5);
    let padding = 5 - chunk.length;
    let val = 0;
    for (let j = 0; j < chunk.length; j++) {
      val = val * 85 + (chunk.charCodeAt(j) - 33);
    }
    for (let j = 0; j < padding; j++) {
      val = val * 85 + 84;
    }
    out.push((val >>> 24) & 0xff, (val >>> 16) & 0xff, (val >>> 8) & 0xff, val & 0xff);
    if (padding > 0) {
      out.splice(out.length - padding, padding);
    }
    i += 5;
  }
  return Buffer.from(out);
}

/**
 * Décode les séquences d'échappement octales PDF (ex: \310 -> È, \351 -> é)
 */
function unescapePdfText(str) {
  if (!str) return '';
  return str
    .replace(/\\([0-7]{1,3})/g, (match, oct) => {
      const charCode = parseInt(oct, 8);
      return String.fromCharCode(charCode);
    })
    .replace(/\\([nrtbf\\()])/g, (match, char) => {
      switch (char) {
        case 'n': return '\n';
        case 'r': return '\r';
        case 't': return '\t';
        case 'b': return '\b';
        case 'f': return '\f';
        default: return char;
      }
    });
}

/**
 * Extrait le texte des commandes Tj et TJ dans le contenu décompressé d'une page
 */
function extractStringsFromPdfContent(content) {
  let texts = [];
  // 1. Chaînes de la commande Tj : (texte) Tj
  const tjRegex = /\(([^)]*)\)\s*Tj/g;
  let m;
  while ((m = tjRegex.exec(content)) !== null) {
    texts.push(unescapePdfText(m[1]));
  }
  // 2. Tableaux de la commande TJ : [(texte) -10 (suite)] TJ
  const arrayTjRegex = /\[([^\]]+)\]\s*TJ/g;
  while ((m = arrayTjRegex.exec(content)) !== null) {
    const innerMatches = m[1].match(/\(([^)]*)\)/g);
    if (innerMatches) {
      texts.push(...innerMatches.map((s) => unescapePdfText(s.slice(1, -1))));
    }
  }
  return texts.join(' ');
}

/**
 * Extracteur natif de texte depuis un fichier PDF (sans dépendances externes)
 * Supporte :
 *  - ASCII85Decode + FlateDecode
 *  - FlateDecode direct
 *  - Streams non compressés
 *  - Détection automatique de dictionnaires / filtres
 */
export const extractTextFromPDF = (filePath) => {
  if (!filePath || !fs.existsSync(filePath)) {
    return '';
  }

  try {
    const buffer = fs.readFileSync(filePath);
    const latinStr = buffer.toString('latin1');
    let extractedText = '';

    let sIdx = latinStr.indexOf('stream');
    while (sIdx !== -1) {
      const eIdx = latinStr.indexOf('endstream', sIdx);
      if (eIdx === -1) break;

      // Récupérer le contenu du stream
      let streamStart = sIdx + 6;
      if (latinStr[streamStart] === '\r' && latinStr[streamStart + 1] === '\n') {
        streamStart += 2;
      } else if (latinStr[streamStart] === '\n' || latinStr[streamStart] === '\r') {
        streamStart += 1;
      }

      let streamEnd = eIdx;
      if (latinStr[streamEnd - 1] === '\n' && latinStr[streamEnd - 2] === '\r') {
        streamEnd -= 2;
      } else if (latinStr[streamEnd - 1] === '\n' || latinStr[streamEnd - 1] === '\r') {
        streamEnd -= 1;
      }

      const rawStream = latinStr.slice(streamStart, streamEnd).trim();

      // Tentative 1 : ASCII85Decode + FlateDecode (ReportLab standard)
      let decompressed = '';
      try {
        const binA85 = decodeAscii85(rawStream);
        decompressed = zlib.inflateSync(binA85).toString('latin1');
      } catch {
        // Tentative 2 : FlateDecode direct
        try {
          const rawBuffer = Buffer.from(rawStream, 'latin1');
          decompressed = zlib.inflateSync(rawBuffer).toString('latin1');
        } catch {
          // Tentative 3 : Raw Inflate
          try {
            const rawBuffer = Buffer.from(rawStream, 'latin1');
            decompressed = zlib.inflateRawSync(rawBuffer).toString('latin1');
          } catch {
            // Tentative 4 : Flux non compressé
            decompressed = rawStream;
          }
        }
      }

      if (decompressed) {
        const pageText = extractStringsFromPdfContent(decompressed);
        if (pageText) {
          extractedText += ' ' + pageText;
        } else {
          // Fallback : extraire les parenthèses simples
          const simpleMatches = decompressed.match(/\(([^)]{2,})\)/g);
          if (simpleMatches) {
            extractedText += ' ' + simpleMatches.map((s) => unescapePdfText(s.slice(1, -1))).join(' ');
          }
        }
      }

      sIdx = latinStr.indexOf('stream', eIdx + 9);
    }

    // Recherche de texte brut résiduel hors-stream
    const rawMatches = latinStr.match(/\(([^)]{2,})\)/g);
    if (rawMatches) {
      extractedText += ' ' + rawMatches.map((s) => unescapePdfText(s.slice(1, -1))).join(' ');
    }

    return extractedText.replace(/\s+/g, ' ').trim();
  } catch (err) {
    console.warn(`Erreur extraction PDF (${filePath}):`, err.message);
    return '';
  }
};

export default extractTextFromPDF;
