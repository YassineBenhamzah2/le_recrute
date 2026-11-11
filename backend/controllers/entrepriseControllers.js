import asyncHandler from 'express-async-handler';
import Entreprise from '../models/entrepriseModel.js';
import User from '../models/userModel.js';

//@desc    Get all active entreprises
//@route   GET /api/entreprises
//@access  Public
export const getEntreprises = asyncHandler(async (req, res) => {
  const entreprises = await Entreprise.find({ actif: true }).sort({ nom: 1 });
  res.json(entreprises);
});

//@desc    Get entreprise by ID
//@route   GET /api/entreprises/:id
//@access  Public
export const getEntrepriseById = asyncHandler(async (req, res) => {
  const entreprise = await Entreprise.findById(req.params.id);

  if (entreprise) {
    res.json(entreprise);
  } else {
    res.status(404);
    throw new Error('Organisation non trouvée');
  }
});

//@desc    Create a new entreprise
//@route   POST /api/entreprises
//@access  Private/Admin
export const createEntreprise = asyncHandler(async (req, res) => {
  const {
    nom,
    sigle,
    secteur,
    description,
    logo,
    logoRecu,
    couleurPrimaire,
    enteteRecu,
    piedRecu,
    siteWeb,
    adresse,
    adminEmail,
    adminPassword,
    adminNom,
    adminPrenom,
  } = req.body;

  const entrepriseExists = await Entreprise.findOne({ nom });
  if (entrepriseExists) {
    res.status(400);
    throw new Error('Une organisation avec ce nom existe déjà');
  }

  const entreprise = await Entreprise.create({
    nom,
    sigle,
    secteur,
    description,
    logo: logo || '/images/logos/default_org.png',
    logoRecu,
    couleurPrimaire: couleurPrimaire || '#003366',
    enteteRecu,
    piedRecu,
    siteWeb,
    adresse,
  });

  let createdAccount = null;
  if (adminEmail && adminPassword) {
    const userExists = await User.findOne({ email: adminEmail });
    if (!userExists) {
      const newUser = await User.create({
        nom: adminNom || nom,
        prenom: adminPrenom || 'Responsable RH',
        email: adminEmail,
        mdp: adminPassword,
        cni: 'RH' + Math.floor(100000 + Math.random() * 900000),
        dateObtentionBac: new Date('2010-01-01'),
        isMaitreOuvrage: true,
        entreprise: entreprise._id,
      });
      createdAccount = {
        email: newUser.email,
        nom: `${newUser.prenom} ${newUser.nom}`,
        role: "Maître d'Ouvrage (RH)",
      };
    }
  }

  res.status(201).json({
    ...entreprise._doc,
    createdAccount,
  });
});

//@desc    Update an entreprise
//@route   PUT /api/entreprises/:id
//@access  Private/Admin
export const updateEntreprise = asyncHandler(async (req, res) => {
  const entreprise = await Entreprise.findById(req.params.id);

  if (entreprise) {
    entreprise.nom = req.body.nom || entreprise.nom;
    entreprise.sigle = req.body.sigle || entreprise.sigle;
    entreprise.secteur = req.body.secteur || entreprise.secteur;
    entreprise.description = req.body.description !== undefined ? req.body.description : entreprise.description;
    entreprise.logo = req.body.logo || entreprise.logo;
    entreprise.logoRecu = req.body.logoRecu || entreprise.logoRecu;
    entreprise.couleurPrimaire = req.body.couleurPrimaire || entreprise.couleurPrimaire;
    entreprise.enteteRecu = req.body.enteteRecu || entreprise.enteteRecu;
    entreprise.piedRecu = req.body.piedRecu || entreprise.piedRecu;
    entreprise.siteWeb = req.body.siteWeb || entreprise.siteWeb;
    entreprise.adresse = req.body.adresse || entreprise.adresse;
    entreprise.actif = req.body.actif !== undefined ? req.body.actif : entreprise.actif;

    const updatedEntreprise = await entreprise.save();
    res.json(updatedEntreprise);
  } else {
    res.status(404);
    throw new Error('Organisation non trouvée');
  }
});
