import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import User from '../models/userModel.js';
import Candidature from '../models/candidatureModel.js';
import Offre from '../models/offreModel.js';

// Liste blanche des assets publics (Workers, templates génériques et spécimens)
const PUBLIC_WHITELIST = new Set([
  'pdf.worker.min.js',
  'Dossier_Candidat_Complet_6_Pages.pdf',
  'Releves_Notes_BENHAMZAH_6_Pages.pdf',
  'Rapport_Audit_Securite_Recrutement_ABB.pdf',
]);

/**
 * Envoie un document avec des en-têtes HTTP de sécurité renforcés (Anti-sniffing, Cache privé, Inline preview)
 */
const serveFileInline = (res, fullPath) => {
  const ext = path.extname(fullPath).toLowerCase();
  const filename = path.basename(fullPath);

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

  if (ext === '.pdf') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  } else if (ext === '.png') {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'inline');
  } else if (ext === '.jpg' || ext === '.jpeg') {
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', 'inline');
  } else {
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  }

  return res.sendFile(fullPath);
};

/**
 * Middleware Coffre-Fort Sécurisé (Secure Document Vault)
 * Garantit la conformité stricte avec la loi CNDP 09-08 (Protection des Données à Caractère Personnel).
 * Tout document confidentiel (CNI, diplôme, notes, attestations, reçus) n'est accessible qu'aux
 * personnes légitimement autorisées (Candidat propriétaire, RH de l'institution, Contrôleur EHC, Admin).
 */
export const documentVault = async (req, res, next) => {
  try {
    const rawFilename = req.params.filename || path.basename(req.path);
    // Assainissement strict contre les attaques Path Traversal (../../)
    const cleanFilename = path.basename(rawFilename).split('?')[0];

    // Recherche physique du fichier dans les dossiers autorisés
    const candidates = [
      path.join(path.resolve(), 'uploads', cleanFilename),
      path.join(path.resolve(), 'backend', 'uploads', cleanFilename),
      path.join(path.resolve(), 'frontend', 'public', 'uploads', cleanFilename),
    ];

    const foundPath = candidates.find((p) => fs.existsSync(p));
    if (!foundPath) {
      return res.status(404).json({ message: 'Document introuvable sur le serveur.' });
    }

    // 1. ASSETS PUBLICS AUTORISÉS (Spécimens, Workers)
    if (PUBLIC_WHITELIST.has(cleanFilename)) {
      return serveFileInline(res, foundPath);
    }

    // 2. AVIS OFFICIELS DE RECRUTEMENT / CONCOURS (Accessibles publiquement à tous les postulants)
    const isPublicAvis = await Offre.exists({
      pdfUrl: { $regex: cleanFilename, $options: 'i' },
    });
    if (isPublicAvis) {
      return serveFileInline(res, foundPath);
    }

    // 3. PIÈCES CONFIDENTIELLES DES CANDIDATS (Extraction du JWT Token via Header ou Query Param)
    const authHeader = req.headers.authorization;
    let token = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        code: 'AUTH_REQUIRED',
        message:
          'Accès confidentiel : Authentification requise pour consulter cette pièce justificative (Conforme CNDP / Loi 09-08).',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        code: 'INVALID_TOKEN',
        message: "Session expirée ou jeton d'authentification invalide.",
      });
    }

    const user = await User.findById(decoded.id).select('-mdp');
    if (!user) {
      return res.status(401).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'Utilisateur introuvable.',
      });
    }

    // 4. MATRICE D'HABILITATION ET DE CONTRÔLE D'ACCÈS (RBAC / ABAC)

    // A. Administrateur Système (Droit d'audit global)
    if (user.isAdmin) {
      return serveFileInline(res, foundPath);
    }

    // B. Contrôleur EHC (Commission d'instruction et d'audit)
    if (user.isController || user.isControleur1 || user.isControleur2) {
      return serveFileInline(res, foundPath);
    }

    // C. Responsable RH de l'entreprise (Maître d'Ouvrage)
    if (user.isMaitreOuvrage) {
      const userEntId = user.entreprise?._id || user.entreprise;

      // Vérifie si le document appartient à une candidature pour cette entreprise
      const matchingCands = await Candidature.find({
        $or: [
          { copieCNI: { $regex: cleanFilename, $options: 'i' } },
          { residence: { $regex: cleanFilename, $options: 'i' } },
          { copieDiplomes: { $regex: cleanFilename, $options: 'i' } },
          { releves: { $regex: cleanFilename, $options: 'i' } },
          { attestationsTravail: { $regex: cleanFilename, $options: 'i' } },
          { numeroDossier: { $regex: cleanFilename, $options: 'i' } },
        ],
      }).populate('offre');

      const isCandMatch = matchingCands.some(
        (cand) =>
          String(cand.entreprise) === String(userEntId) ||
          String(cand.offre?.entreprise) === String(userEntId)
      );

      if (isCandMatch) {
        return serveFileInline(res, foundPath);
      }

      // Si le RH lui-même a téléversé le fichier (brouillon d'offre, audit interne)
      if (cleanFilename.includes(`_u${user._id}_`)) {
        return serveFileInline(res, foundPath);
      }
    }

    // D. Le Candidat propriétaire du dossier
    // 1. Signature directe de l'utilisateur dans le nom du fichier
    if (cleanFilename.includes(`_u${user._id}_`)) {
      return serveFileInline(res, foundPath);
    }

    // 2. Pièces enregistrées dans le profil utilisateur (CNI, Résidence)
    if (
      (user.copieCNI && user.copieCNI.includes(cleanFilename)) ||
      (user.residence && user.residence.includes(cleanFilename))
    ) {
      return serveFileInline(res, foundPath);
    }

    // 3. Pièces d'une candidature déposée par ce candidat
    const isOwnerOfCandidature = await Candidature.exists({
      user: user._id,
      $or: [
        { copieCNI: { $regex: cleanFilename, $options: 'i' } },
        { residence: { $regex: cleanFilename, $options: 'i' } },
        { copieDiplomes: { $regex: cleanFilename, $options: 'i' } },
        { releves: { $regex: cleanFilename, $options: 'i' } },
        { attestationsTravail: { $regex: cleanFilename, $options: 'i' } },
        { numeroDossier: { $regex: cleanFilename, $options: 'i' } },
      ],
    });

    if (isOwnerOfCandidature) {
      return serveFileInline(res, foundPath);
    }

    // 4. Récépissé officiel généré pour ce candidat
    if (cleanFilename.startsWith('recu-candidature_')) {
      const isReceiptOwner = await Candidature.exists({ user: user._id });
      if (isReceiptOwner) {
        return serveFileInline(res, foundPath);
      }
    }

    // 5. ACCÈS INTERDIT : L'utilisateur n'est pas habilité à voir ce document confidentiel
    return res.status(403).json({
      success: false,
      code: 'FORBIDDEN_DOCUMENT',
      message:
        "Accès interdit : Vous n'avez pas les habilitations nécessaires pour consulter ce document confidentiel (Loi 09-08 / CNDP).",
    });
  } catch (err) {
    console.error('Erreur Document Vault:', err);
    return res.status(500).json({
      message: "Erreur interne lors de la vérification des droits d'accès au document.",
    });
  }
};

export default documentVault;
