import asyncHandler from 'express-async-handler';
import Candidature from '../models/candidatureModel.js';
import User from '../models/userModel.js';
import Offre from '../models/offreModel.js';
import calculateDynamicScore from '../utils/dynamicScoringEngine.js';
import executeAIAudit from '../services/aiAuditService.js';
import {
  controleAge,
  controleExperience,
  controleExperienceBancaire,
  controleNote,
} from '../utils/controleCondidat.js';

//@desc Create new candidature
//@route POST /api/candidatures
//@access Private
const addCandidature = asyncHandler(async (req, res) => {
  // RÈGLE DE SÉCURITÉ : Interdire aux profils institutionnels (RH, Admins, Contrôleurs) de postuler
  if (
    req.user &&
    (req.user.isMaitreOuvrage ||
      req.user.isAdmin ||
      req.user.isAdministrateur ||
      req.user.isController ||
      req.user.isControlleur ||
      req.user.isControleur1 ||
      req.user.isControleur2 ||
      req.user.role === 'rh' ||
      req.user.role === 'admin')
  ) {
    res.status(403);
    throw new Error(
      'Action non autorisée : Les comptes institutionnels (Recruteurs RH, Administrateurs, Membres de la Commission) ne peuvent pas déposer de candidatures aux concours.'
    );
  }

  const {
    offre: offreId,
    niveauEtude,
    specialite,
    diplome,
    mention,
    dateObtention,
    etablissement,
    methodeNotation,
    annee1,
    annee2,
    annee3,
    semestre1,
    semestre2,
    semestre3,
    semestre4,
    semestre5,
    semestre6,
    moyenneOFFPT,
    situationActuelle,
    disponibilite,
    poste,
    experiences,
    controle1,
    controle2,
    isControl1,
    isControl2,
    conforme,
    eligibilite,
    motif,
    dossier,
    releves,
    copieDiplomes,
    attestationsTravail,
  } = req.body;

  // Récupérer l'offre et ses règles de scoring si spécifiée
  let offreDoc = null;
  if (offreId) {
    offreDoc = await Offre.findById(offreId);
  }
  if (!offreDoc && poste) {
    offreDoc = await Offre.findOne({ titre: poste });
  }

  // Vérifier doublon : un utilisateur ne peut postuler qu'une seule fois à la même offre
  let query = { user: req.user._id };
  if (offreDoc) {
    query.offre = offreDoc._id;
  } else if (poste) {
    query.poste = poste;
  }
  const candidatureExists = await Candidature.findOne(query);

  if (candidatureExists) {
    res.status(400);
    throw new Error(`Vous avez déjà postulé à ce poste (${poste || offreDoc?.titre || 'ce concours'})`);
  }

  // Générer un numéro de dossier unique infalsifiable
  const prefix = offreDoc?.entrepriseSigle || 'REC';
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const numeroDossier = `${prefix}-${new Date().getFullYear()}-${randomSuffix}`;

  const candidature = new Candidature({
    offre: offreDoc?._id || offreId || null,
    entreprise: offreDoc?.entreprise || null,
    numeroDossier,
    niveauEtude,
    specialite,
    diplome,
    mention,
    dateObtention,
    etablissement,
    methodeNotation: methodeNotation || 'Annees',
    annee1,
    annee2,
    annee3,
    semestre1,
    semestre2,
    semestre3,
    semestre4,
    semestre5,
    semestre6,
    moyenneOFFPT,
    situationActuelle,
    disponibilite,
    poste: poste || offreDoc?.titre || 'Poste Officiel',
    experiences: experiences || [],
    controle1,
    controle2,
    isControl1,
    isControl2,
    conforme,
    eligibilite,
    motif,
    dossier,
    releves,
    copieDiplomes,
    attestationsTravail,
    user: req.user._id,
  });

  const user = await User.findById(req.user._id);

  // Moteur de Scoring Dynamique (Multi-Entreprises & Multi-Barèmes)
  if (offreDoc && offreDoc.scoringRules) {
    try {
      const scoreResult = calculateDynamicScore(
        candidature,
        user,
        offreDoc.scoringRules
      );
      candidature.scoreTotal = scoreResult.scoreTotal;
      candidature.scoreAge = scoreResult.scoreAge;
      candidature.scoreNote = scoreResult.scoreNote;
      candidature.scoreMention = scoreResult.scoreMention;
      candidature.scoreExperience = scoreResult.scoreExperience;
      candidature.scoreDiplome = scoreResult.scoreDiplome;
      candidature.scoreExperienceBancaire = scoreResult.scoreExperience; // rétrocompatibilité
      candidature.scoreDetails = scoreResult.details;
    } catch (scoreErr) {
      console.error('Erreur lors du calcul dynamique du score:', scoreErr);
    }
  } else {
    // Fallback scoring legacy si offre sans règles personnalisées
    candidature.scoreNote = controleNote(
      candidature.methodeNotation,
      candidature.niveauEtude,
      candidature.annee1,
      candidature.annee2,
      candidature.annee3,
      candidature.semestre1,
      candidature.semestre2,
      candidature.semestre3,
      candidature.semestre4,
      candidature.semestre5,
      candidature.semestre6,
      candidature.moyenneOFFPT
    );

    candidature.scoreExperience = controleExperience(experiences || []);
    candidature.scoreExperienceBancaire = controleExperienceBancaire(
      experiences || []
    );

    let userScoreAge = Number(user?.scoreAge);
    if (isNaN(userScoreAge) || userScoreAge === 0) {
      userScoreAge = user?.dateNaissance ? controleAge(user.dateNaissance) : 0;
    }

    const sNote = Number(candidature.scoreNote) || 0;
    const sExp = Number(candidature.scoreExperience) || 0;
    const sExpBanc = Number(candidature.scoreExperienceBancaire) || 0;

    candidature.scoreAge = userScoreAge;
    candidature.scoreNote = sNote;
    candidature.scoreExperience = sExp;
    candidature.scoreExperienceBancaire = sExpBanc;
    candidature.scoreTotal = Number(
      (userScoreAge + sExp + sExpBanc + sNote).toFixed(2)
    );
  }

  // EXÉCUTION AUTOMATIQUE DU CONTRÔLE NIVEAU 1 (IA AUDITOR)
  try {
    const aiAuditResult = await executeAIAudit(candidature, user, offreDoc);
    candidature.statutAI = aiAuditResult.statutAI;
    candidature.auditAI = aiAuditResult.auditAI;
    candidature.isControl1 = false;
    candidature.controle1 = `Audit IA (${aiAuditResult.statutAI}) — Score confiance: ${aiAuditResult.auditAI.scoreConfiance}%`;

    if (aiAuditResult.statutAI === 'VALIDE_IA') {
      candidature.conforme = 'CONFORME';
      candidature.eligibilite = 'ELIGIBLE';
    } else if (aiAuditResult.statutAI === 'REJETE_IA') {
      candidature.conforme = 'NON CONFORME';
      candidature.eligibilite = 'NON ELIGIBLE';
      candidature.motif = 'NENA';
    }
  } catch (err) {
    console.warn('Erreur exécution audit IA:', err);
  }

  const createdCandidature = await candidature.save();
  await createdCandidature.populate('user');
  await createdCandidature.populate('offre');
  await createdCandidature.populate('entreprise');

  const isStaff =
    req.user &&
    (req.user.isAdmin ||
      req.user.isMaitreOuvrage ||
      req.user.isControleur1 ||
      req.user.isControleur2);
  const responseData = createdCandidature.toObject();
  if (!isStaff) {
    delete responseData.scoreTotal;
    delete responseData.scoreAge;
    delete responseData.scoreNote;
    delete responseData.scoreMention;
    delete responseData.scoreExperience;
    delete responseData.scoreDiplome;
    delete responseData.scoreExperienceBancaire;
    delete responseData.scoreDetails;
  }
  res.status(201).json(responseData);
});

//@desc Get candidature by Id
//@route GET /api/candidatures/:id
//@access Private

const getCandidatureById = asyncHandler(async (req, res) => {
  const candidature = await Candidature.findById(req.params.id)
    .populate('user')
    .populate('offre')
    .populate('entreprise');

  if (candidature) {
    // SÉCURITÉ MULTI-TENANT : Isolation étanche des entreprises
    if (req.user && req.user.isMaitreOuvrage && !req.user.isAdmin) {
      const userEntId = String(req.user.entreprise?._id || req.user.entreprise);
      const candEntId = String(candidature.entreprise?._id || candidature.entreprise || candidature.offre?.entreprise);
      if (userEntId !== candEntId) {
        res.status(403);
        throw new Error("Accès refusé : vous n'êtes pas autorisé à consulter un dossier d'une autre institution.");
      }
    }

    const isStaff =
      req.user &&
      (req.user.isAdmin ||
        req.user.isMaitreOuvrage ||
        req.user.isControleur1 ||
        req.user.isControleur2);
    const candidatureObj = candidature.toObject();
    if (!isStaff) {
      delete candidatureObj.scoreTotal;
      delete candidatureObj.scoreAge;
      delete candidatureObj.scoreNote;
      delete candidatureObj.scoreMention;
      delete candidatureObj.scoreExperience;
      delete candidatureObj.scoreDiplome;
      delete candidatureObj.scoreExperienceBancaire;
      delete candidatureObj.scoreDetails;
    }
    res.json(candidatureObj);
  } else {
    res.status(404);
    throw Error('Not Found');
  }
});

//@desc GET logged in user candidatures
//@route GET /api/candidatures/mescandidatures
//@access Private
const getMyCandidatures = asyncHandler(async (req, res) => {
  const isStaff =
    req.user &&
    (req.user.isAdmin ||
      req.user.isMaitreOuvrage ||
      req.user.isControleur1 ||
      req.user.isControleur2);
  let query = Candidature.find({ user: req.user._id });
  if (!isStaff) {
    query = query.select(
      '-scoreTotal -scoreAge -scoreNote -scoreMention -scoreExperience -scoreDiplome -scoreExperienceBancaire -scoreDetails'
    );
  }
  const candidatures = await query
    .populate('offre')
    .populate('entreprise');
  res.json(candidatures);
});

//@desc GET all candidatures
//@route GET /api/candidatures/mescandidatures
//@access Private Admin
const getCandidatures = asyncHandler(async (req, res) => {
  const query = {};
  // SÉCURITÉ MULTI-TENANT STRICTE : L'entreprise RH ne voit QUE ses propres candidatures
  if (req.user && req.user.isMaitreOuvrage && !req.user.isAdmin) {
    query.entreprise = req.user.entreprise?._id || req.user.entreprise;
  } else if (req.query.entreprise) {
    query.entreprise = req.query.entreprise;
  }
  if (req.query.offre) {
    query.offre = req.query.offre;
  }

  const candidatures = await Candidature.find(query)
    .populate('user')
    .populate('offre')
    .populate('entreprise');

  // AUTO-AUDIT IA ON THE FLY: Scanner et appliquer l'audit approfondi du contenu PDF sur tous les dossiers
  for (const cand of candidatures) {
    try {
      const aiResult = await executeAIAudit(cand, cand.user, cand.offre);
      cand.statutAI = aiResult.statutAI;
      cand.auditAI = aiResult.auditAI;
      cand.controle1 = `Audit IA (${aiResult.statutAI}) — Confiance: ${aiResult.auditAI.scoreConfiance}%`;
      if (aiResult.statutAI === 'VALIDE_IA') {
        cand.conforme = 'CONFORME';
        cand.eligibilite = 'ELIGIBLE';
      } else if (aiResult.statutAI === 'REJETE_IA') {
        cand.conforme = 'NON CONFORME';
        cand.eligibilite = 'NON ELIGIBLE';
      }
      await cand.save();
    } catch (e) {
      console.warn('Erreur auto-audit IA à la volée:', e);
    }
  }

  res.json(candidatures);
});

//@desc Update candidatures
//@route PUT /api/candidatures/:id
//@access Private/Admin
const updateCandidature = asyncHandler(async (req, res) => {
  const candidature = await Candidature.findById(req.params.id);
  if (candidature) {
    if (req.user && req.user.isMaitreOuvrage && !req.user.isAdmin) {
      const userEntId = String(req.user.entreprise?._id || req.user.entreprise);
      const candEntId = String(candidature.entreprise?._id || candidature.entreprise);
      if (userEntId !== candEntId) {
        res.status(403);
        throw new Error("Accès refusé : vous ne pouvez pas modifier un dossier d'une autre institution.");
      }
    }
    candidature.niveauEtude = req.body.niveauEtude || candidature.niveauEtude;
    candidature.specialite = req.body.specialite || candidature.specialite;
    candidature.diplome = req.body.diplome || candidature.diplome;
    candidature.mention = req.body.mention || candidature.mention;
    candidature.dateObtention =
      req.body.dateObtention || candidature.dateObtention;
    candidature.etablissement =
      req.body.etablissement || candidature.etablissement;
    candidature.methodeNotation =
      req.body.methodeNotation || candidature.methodeNotation;
    candidature.annee1 = req.body.annee1 || candidature.annee1;
    candidature.annee2 = req.body.annee2 || candidature.annee2;
    candidature.annee3 = req.body.annee3 || candidature.annee3;
    candidature.semestre1 = req.body.semestre1 || candidature.semestre1;
    candidature.semestre2 = req.body.semestre2 || candidature.semestre2;
    candidature.semestre3 = req.body.semestre3 || candidature.semestre3;
    candidature.semestre4 = req.body.semestre4 || candidature.semestre4;
    candidature.semestre5 = req.body.semestre5 || candidature.semestre5;
    candidature.semestre6 = req.body.semestre6 || candidature.semestre6;
    candidature.moyenneOFFPT =
      req.body.moyenneOFFPT || candidature.moyenneOFFPT;
    candidature.situationActuelle =
      req.body.situationActuelle || candidature.situationActuelle;
    candidature.disponibilite =
      req.body.disponibilite || candidature.disponibilite;
    candidature.conforme = req.body.conforme || candidature.conforme;
    candidature.poste = req.body.poste || candidature.poste;
    candidature.scoreNote = req.body.scoreNote || candidature.scoreNote;
    candidature.scoreExperience =
      req.body.scoreExperience || candidature.scoreExperience;
    candidature.scoreExperienceBancaire =
      req.body.scoreExperienceBancaire || candidature.scoreExperienceBancaire;
    candidature.scoreTotal = req.body.scoreTotal || candidature.scoreTotal;
    candidature.controle1 = req.body.controle1 || candidature.controle1;
    candidature.controle2 = req.body.controle2 || candidature.controle2;
    candidature.controle3 = req.body.controle3 || candidature.controle3;
    candidature.isControl1 = req.body.isControl1 !== undefined ? req.body.isControl1 : candidature.isControl1;
    candidature.isControl2 = req.body.isControl2 !== undefined ? req.body.isControl2 : candidature.isControl2;
    candidature.isControl3 = req.body.isControl3 !== undefined ? req.body.isControl3 : candidature.isControl3;
    candidature.statutAI = req.body.statutAI || candidature.statutAI;
    candidature.statutCommission = req.body.statutCommission || candidature.statutCommission;
    if (req.body.auditAI) {
      candidature.auditAI = req.body.auditAI;
    }
    candidature.conforme = req.body.conforme || candidature.conforme;
    candidature.eligibilite = req.body.eligibilite || candidature.eligibilite;
    candidature.motif = req.body.motif || candidature.motif;
    candidature.dossier = req.body.dossier || candidature.dossier;
    candidature.releves = req.body.releves || candidature.releves;
    candidature.copieDiplomes =
      req.body.copieDiplomes || candidature.copieDiplomes;
    candidature.attestationsTravail =
      req.body.attestationsTravail || candidature.attestationsTravail;

    const updatedCandidature = await candidature.save();

    res.json({
      _id: updatedCandidature._id,
      niveauEtude: updatedCandidature.niveauEtude,
      specialite: updatedCandidature.specialite,
      diplome: updatedCandidature.diplome,
      mention: updatedCandidature.mention,
      dateObtention: updatedCandidature.dateObtention,
      etablissement: updatedCandidature.etablissement,
      methodeNotation: updatedCandidature.methodeNotation,
      annee1: updatedCandidature.annee1,
      annee2: updatedCandidature.annee2,
      annee3: updatedCandidature.annee3,
      semestre1: updatedCandidature.semestre1,
      semestre2: updatedCandidature.semestre2,
      semestre3: updatedCandidature.semestre3,
      semestre4: updatedCandidature.semestre4,
      semestre5: updatedCandidature.semestre5,
      semestre6: updatedCandidature.semestre6,
      moyenneOFFPT: updatedCandidature.moyenneOFFPT,
      situationActuelle: updatedCandidature.situationActuelle,
      disponibilite: updatedCandidature.disponibilite,
      conforme: updatedCandidature.conforme,
      poste: updatedCandidature.poste,
      scoreNote: updatedCandidature.scoreNote,
      scoreExperience: updatedCandidature.scoreExperience,
      scoreExperienceBancaire: updatedCandidature.scoreExperienceBancaire,
      scoreTotal: updatedCandidature.scoreTotal,
      controle1: updatedCandidature.controle1,
      controle2: updatedCandidature.controle2,
      controle3: updatedCandidature.controle3,
      isControl1: updatedCandidature.isControl1,
      isControl2: updatedCandidature.isControl2,
      isControl3: updatedCandidature.isControl3,
      statutAI: updatedCandidature.statutAI,
      auditAI: updatedCandidature.auditAI,
      statutCommission: updatedCandidature.statutCommission,
      eligibilite: updatedCandidature.eligibilite,
      motif: updatedCandidature.motif,
      dossier: updatedCandidature.dossier,
      releves: updatedCandidature.releves,
      copieDiplomes: updatedCandidature.copieDiplomes,
      attestationsTravail: updatedCandidature.attestationsTravail,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

//@desc GET logged in controller candidatures (Premier Contrôle)
//@route GET /api/candidatures/controlleurs/list
//@access Private
const getControllerCandidatures = asyncHandler(async (req, res) => {
  const controllerName = `${req.user.prenom} ${req.user.nom}`;
  const query = {
    $or: [
      { isControl1: false },
      { isControl1: null },
      { isControl1: { $exists: false } },
    ],
  };

  if (req.query.entreprise) {
    query.entreprise = req.query.entreprise;
  } else if (req.user && req.user.entreprise && !req.user.isAdmin) {
    query.entreprise = req.user.entreprise;
  }
  if (req.query.offre) {
    query.offre = req.query.offre;
  }

  const candidatures = await Candidature.find(query)
    .populate('user')
    .populate('offre')
    .populate('entreprise');

  // AUTO-AUDIT IA ON THE FLY: Scanner et appliquer l'audit approfondi du contenu PDF sur tous les dossiers
  for (const cand of candidatures) {
    try {
      const aiResult = await executeAIAudit(cand, cand.user, cand.offre);
      cand.statutAI = aiResult.statutAI;
      cand.auditAI = aiResult.auditAI;
      cand.controle1 = `Audit IA (${aiResult.statutAI}) — Confiance: ${aiResult.auditAI.scoreConfiance}%`;
      if (aiResult.statutAI === 'VALIDE_IA') {
        cand.conforme = 'CONFORME';
        cand.eligibilite = 'ELIGIBLE';
      } else if (aiResult.statutAI === 'REJETE_IA') {
        cand.conforme = 'NON CONFORME';
        cand.eligibilite = 'NON ELIGIBLE';
      }
      await cand.save();
    } catch (e) {
      console.warn('Erreur auto-audit IA à la volée:', e);
    }
  }

  res.json(candidatures);
});

//@desc GET logged in controller candidatures (Deuxième Contrôle)
//@route GET /api/candidatures/controlleurs/list/2
//@access Private
const getControllerCandidatures2 = asyncHandler(async (req, res) => {
  const controllerName = `${req.user.prenom} ${req.user.nom}`;
  const query = {
    isControl1: true,
    $or: [
      { controle2: controllerName },
      { isControl2: false },
      { controle2: null },
      { controle2: '' },
      { controle2: { $exists: false } },
    ],
  };

  if (req.query.entreprise) {
    query.entreprise = req.query.entreprise;
  } else if (req.user && req.user.entreprise && !req.user.isAdmin) {
    query.entreprise = req.user.entreprise;
  }
  if (req.query.offre) {
    query.offre = req.query.offre;
  }

  const candidatures = await Candidature.find(query)
    .populate('user')
    .populate('offre')
    .populate('entreprise');

  // AUTO-AUDIT IA ON THE FLY: Scanner et appliquer l'audit approfondi du contenu PDF sur tous les dossiers
  for (const cand of candidatures) {
    try {
      const aiResult = await executeAIAudit(cand, cand.user, cand.offre);
      cand.statutAI = aiResult.statutAI;
      cand.auditAI = aiResult.auditAI;
      cand.controle1 = `Audit IA (${aiResult.statutAI}) — Confiance: ${aiResult.auditAI.scoreConfiance}%`;
      if (aiResult.statutAI === 'VALIDE_IA') {
        cand.conforme = 'CONFORME';
        cand.eligibilite = 'ELIGIBLE';
      } else if (aiResult.statutAI === 'REJETE_IA') {
        cand.conforme = 'NON CONFORME';
        cand.eligibilite = 'NON ELIGIBLE';
      }
      await cand.save();
    } catch (e) {
      console.warn('Erreur auto-audit IA à la volée:', e);
    }
  }

  res.json(candidatures);
});

//@desc GET logged in controller candidatures (Troisième Contrôle - Commission Finale EHC)
//@route GET /api/candidatures/controlleurs/list/3
//@access Private
const getControllerCandidatures3 = asyncHandler(async (req, res) => {
  const query = {
    isControl1: true,
    isControl2: true,
  };

  if (req.query.entreprise) {
    query.entreprise = req.query.entreprise;
  } else if (req.user && req.user.entreprise && !req.user.isAdmin) {
    query.entreprise = req.user.entreprise;
  }
  if (req.query.offre) {
    query.offre = req.query.offre;
  }

  const candidatures = await Candidature.find(query)
    .populate('user')
    .populate('offre')
    .populate('entreprise');

  // AUTO-AUDIT IA ON THE FLY: Scanner et appliquer l'audit approfondi du contenu PDF sur tous les dossiers
  for (const cand of candidatures) {
    try {
      const aiResult = await executeAIAudit(cand, cand.user, cand.offre);
      cand.statutAI = aiResult.statutAI;
      cand.auditAI = aiResult.auditAI;
      cand.controle1 = `Audit IA (${aiResult.statutAI}) — Confiance: ${aiResult.auditAI.scoreConfiance}%`;
      if (aiResult.statutAI === 'VALIDE_IA') {
        cand.conforme = 'CONFORME';
        cand.eligibilite = 'ELIGIBLE';
      } else if (aiResult.statutAI === 'REJETE_IA') {
        cand.conforme = 'NON CONFORME';
        cand.eligibilite = 'NON ELIGIBLE';
      }
      await cand.save();
    } catch (e) {
      console.warn('Erreur auto-audit IA à la volée:', e);
    }
  }

  res.json(candidatures);
});

//@desc Lancer l'Audit IA sur une candidature individuelle (Niveau 1)
//@route POST /api/candidatures/:id/ai-audit
//@access Private/Staff
const runCandidatureAIAudit = asyncHandler(async (req, res) => {
  const candidature = await Candidature.findById(req.params.id)
    .populate('user')
    .populate('offre');

  if (!candidature) {
    res.status(404);
    throw new Error('Candidature introuvable');
  }

  const aiResult = await executeAIAudit(candidature, candidature.user, candidature.offre);

  candidature.statutAI = aiResult.statutAI;
  candidature.auditAI = aiResult.auditAI;
  candidature.isControl1 = true;
  candidature.controle1 = `Audit IA (${aiResult.statutAI}) — Score confiance: ${aiResult.auditAI.scoreConfiance}%`;

  if (aiResult.statutAI === 'VALIDE_IA') {
    candidature.conforme = 'CONFORME';
    candidature.eligibilite = 'ELIGIBLE';
  } else if (aiResult.statutAI === 'REJETE_IA') {
    candidature.conforme = 'NON CONFORME';
    candidature.eligibilite = 'NON ELIGIBLE';
    candidature.motif = 'NENA';
  }

  const saved = await candidature.save();
  res.json({
    success: true,
    candidature: saved,
    aiResult,
  });
});

//@desc Lancer l'Audit IA en lot (Batch Processing 90k+)
//@route POST /api/candidatures/batch/ai-audit
//@access Private/Staff
const runBatchAIAudit = asyncHandler(async (req, res) => {
  const query = req.body.offreId ? { offre: req.body.offreId } : {};
  const candidatures = await Candidature.find(query)
    .populate('user')
    .populate('offre');

  let processedCount = 0;
  let conformesCount = 0;
  let anomaliesCount = 0;
  let rejetesCount = 0;

  for (const cand of candidatures) {
    const aiResult = await executeAIAudit(cand, cand.user, cand.offre);
    cand.statutAI = aiResult.statutAI;
    cand.auditAI = aiResult.auditAI;
    // Garde isControl1 à false pour permettre la revue du contrôleur humain, sauf si déjà validé
    if (!cand.isControl1) {
      cand.isControl1 = false;
    }
    cand.controle1 = `Audit IA (${aiResult.statutAI}) — Confiance: ${aiResult.auditAI.scoreConfiance}%`;

    if (aiResult.statutAI === 'VALIDE_IA') {
      conformesCount++;
      cand.conforme = 'CONFORME';
      cand.eligibilite = 'ELIGIBLE';
    } else if (aiResult.statutAI === 'ANOMALIE_IA') {
      anomaliesCount++;
    } else {
      rejetesCount++;
      cand.conforme = 'NON CONFORME';
      cand.eligibilite = 'NON ELIGIBLE';
    }

    await cand.save();
    processedCount++;
  }

  res.json({
    success: true,
    processedCount,
    conformesCount,
    anomaliesCount,
    rejetesCount,
  });
});

//@desc Valider les dossiers du Contrôle 1 vers le Contrôle 2 (individuel ou tous les conformes IA)
//@route POST /api/candidatures/batch/validate-control1
//@access Private/Staff
const validateBatchControl1 = asyncHandler(async (req, res) => {
  const { ids, onlyConformes } = req.body;
  let filter = {};

  if (Array.isArray(ids) && ids.length > 0) {
    filter = { _id: { $in: ids } };
  } else if (onlyConformes) {
    filter = { statutAI: 'VALIDE_IA', isControl1: false };
  } else {
    filter = { isControl1: false };
  }

  const controllerName = req.user ? `${req.user.prenom || ''} ${req.user.nom || ''}`.trim() : 'Contrôleur EHC';
  const result = await Candidature.updateMany(filter, {
    $set: {
      isControl1: true,
      controle1: `Validé Niveau 1 par ${controllerName} (Audit IA vérifié)`,
    },
  });

  res.json({
    success: true,
    modifiedCount: result.modifiedCount || result.nModified || 0,
  });
});

//@desc Valider les dossiers du Contrôle 3 (Commission EHC - Validation Finale avant transmission RH)
//@route POST /api/candidatures/batch/validate-control3
//@access Private/Staff
const validateBatchControl3 = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  let filter = { isControl1: true, isControl2: true };

  if (Array.isArray(ids) && ids.length > 0) {
    filter._id = { $in: ids };
  }

  const commissionName = req.user
    ? `Commission EHC (${req.user.prenom || ''} ${req.user.nom || ''})`.trim()
    : 'Commission EHC Audit Marchés Publics';

  const result = await Candidature.updateMany(filter, {
    $set: {
      isControl3: true,
      statutCommission: 'VALIDE_COMMISSION',
      controle3: commissionName,
    },
  });

  res.json({
    success: true,
    modifiedCount: result.modifiedCount || result.nModified || 0,
  });
});

export {
  addCandidature,
  getCandidatureById,
  getMyCandidatures,
  getCandidatures,
  updateCandidature,
  getControllerCandidatures,
  getControllerCandidatures2,
  getControllerCandidatures3,
  runCandidatureAIAudit,
  runBatchAIAudit,
  validateBatchControl1,
  validateBatchControl3,
};
