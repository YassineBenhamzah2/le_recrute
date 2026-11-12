import asyncHandler from 'express-async-handler';
import Offre from '../models/offreModel.js';
import Entreprise from '../models/entrepriseModel.js';

//@desc Récupérer toutes les offres d'emploi
//@route GET /api/offres
//@access Public
const getOffres = asyncHandler(async (req, res) => {
  const offres = await Offre.find({})
    .populate('entreprise')
    .sort({ createdAt: -1 });

  res.json(offres);
});

//@desc Récupérer une offre par son ID ou Titre
//@route GET /api/offres/:id
//@access Public
const getOffreById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let offre;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    offre = await Offre.findById(id).populate('entreprise');
  } else {
    offre = await Offre.findOne({ titre: decodeURIComponent(id) }).populate('entreprise');
  }

  if (offre) {
    res.json(offre);
  } else {
    res.status(404);
    throw new Error('Offre introuvable');
  }
});

//@desc Publier une nouvelle offre
//@route POST /api/offres
//@access Private / Admin
const createOffre = asyncHandler(async (req, res) => {
  const {
    titre,
    entreprise: entrepriseId,
    specialite,
    secteur,
    ville,
    niveau,
    postes,
    statut,
    description,
    profilRecherche,
    dateLimite,
    pdfUrl,
    scoringRules,
  } = req.body;

  if (!titre) {
    res.status(400);
    throw new Error('Le titre du poste est requis');
  }

  let entrepriseDoc = null;
  const targetEntrepriseId = entrepriseId || (req.user && req.user.entreprise ? req.user.entreprise : null);
  if (targetEntrepriseId && !entrepriseDoc) {
    entrepriseDoc = await Entreprise.findById(targetEntrepriseId);
  }

  const offre = new Offre({
    titre,
    entreprise: targetEntrepriseId || null,
    entrepriseNom: entrepriseDoc ? entrepriseDoc.nom : req.body.entrepriseNom || 'Institution Recruteuse',
    entrepriseSigle: entrepriseDoc ? entrepriseDoc.sigle : req.body.entrepriseSigle || 'REC',
    entrepriseLogo: entrepriseDoc ? entrepriseDoc.logo : req.body.entrepriseLogo || '',
    entrepriseCouleur: entrepriseDoc ? entrepriseDoc.couleurPrimaire : req.body.entrepriseCouleur || '#1D4ED8',
    specialite: specialite || 'Réseau Agences Bancaires',
    secteur: secteur || (entrepriseDoc ? entrepriseDoc.secteur : 'Secteur Bancaire'),
    ville: ville || 'Réseau National',
    niveau: niveau || 'Bac +2 / Bac +3',
    postes: Number(postes) || 1,
    statut: statut || 'En cours',
    description: description || '',
    profilRecherche: profilRecherche || '',
    dateLimite: dateLimite || null,
    pdfUrl:
      typeof pdfUrl === 'object' && pdfUrl !== null
        ? pdfUrl.url || pdfUrl.filePath || ''
        : pdfUrl || '',
    user: req.user ? req.user._id : null,
    ...(scoringRules || req.body.reglesScoring
      ? { scoringRules: scoringRules || req.body.reglesScoring }
      : {}),
  });

  const createdOffre = await offre.save();
  res.status(201).json(createdOffre);
});

//@desc Supprimer une offre
//@route DELETE /api/offres/:id
//@access Private / Admin
const deleteOffre = asyncHandler(async (req, res) => {
  const offre = await Offre.findById(req.params.id);

  if (offre) {
    await offre.remove();
    res.json({ message: 'Offre supprimée avec succès' });
  } else {
    res.status(404);
    throw new Error('Offre introuvable');
  }
});

//@desc Mettre à jour une offre
//@route PUT /api/offres/:id
//@access Private / Admin
const updateOffre = asyncHandler(async (req, res) => {
  const {
    titre,
    entreprise: entrepriseId,
    specialite,
    secteur,
    ville,
    niveau,
    postes,
    statut,
    description,
    profilRecherche,
    dateLimite,
    pdfUrl,
    scoringRules,
  } = req.body;

  const offre = await Offre.findById(req.params.id);

  if (offre) {
    if (entrepriseId && String(offre.entreprise) !== String(entrepriseId)) {
      const entrepriseDoc = await Entreprise.findById(entrepriseId);
      if (entrepriseDoc) {
        offre.entreprise = entrepriseDoc._id;
        offre.entrepriseNom = entrepriseDoc.nom;
        offre.entrepriseSigle = entrepriseDoc.sigle;
        offre.entrepriseLogo = entrepriseDoc.logo;
        offre.entrepriseCouleur = entrepriseDoc.couleurPrimaire;
      }
    }

    offre.titre = titre || offre.titre;
    offre.specialite = specialite || offre.specialite;
    offre.secteur = secteur || offre.secteur;
    offre.ville = ville || offre.ville;
    offre.niveau = niveau || offre.niveau;
    if (postes !== undefined) offre.postes = Number(postes);
    offre.statut = statut || offre.statut;
    if (description !== undefined) offre.description = description;
    if (profilRecherche !== undefined) offre.profilRecherche = profilRecherche;
    if (dateLimite !== undefined) offre.dateLimite = dateLimite;
    const normalizedPdf =
      typeof pdfUrl === 'object' && pdfUrl !== null
        ? pdfUrl.url || pdfUrl.filePath || ''
        : pdfUrl || '';

    if (pdfUrl !== undefined) offre.pdfUrl = normalizedPdf;
    if (scoringRules !== undefined) offre.scoringRules = scoringRules;

    const updatedOffre = await offre.save();
    res.json(updatedOffre);
  } else {
    res.status(404);
    throw new Error('Offre introuvable');
  }
});

export { getOffres, getOffreById, createOffre, deleteOffre, updateOffre };
