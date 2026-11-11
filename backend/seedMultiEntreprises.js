import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Entreprise from './models/entrepriseModel.js';
import Offre from './models/offreModel.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/recrutement_ccp';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connecté pour le seeding multi-entreprises...');

    // 1. DÉFINITION DES ORGANISATIONS
    const entreprisesData = [
      {
        nom: 'Al Barid Bank',
        sigle: 'ABB',
        secteur: 'Secteur Bancaire',
        description: 'Banque postale et citoyenne leader de l’inclusion financière au Maroc.',
        logo: '/images/logos/abb_logo.png',
        couleurPrimaire: '#003366',
        enteteRecu: 'Al Barid Bank - Direction du Capital Humain & Recrutement',
        piedRecu: 'Récépissé officiel de candidature. Horodaté et certifié conforme Loi 09-08 (CNDP).',
        siteWeb: 'https://www.albaridbank.ma',
        adresse: 'Avenue Hassan II, Rabat, Maroc',
      },
      {
        nom: 'CIH Bank',
        sigle: 'CIH',
        secteur: 'Secteur Bancaire',
        description: 'Banque innovante, digitale et tournée vers la jeunesse et les professionnels.',
        logo: '/images/logos/cih_logo.png',
        couleurPrimaire: '#0084B6',
        enteteRecu: 'CIH Bank - Direction des Ressources Humaines',
        piedRecu: 'Accusé de réception électronique certifié. Document faisant foi.',
        siteWeb: 'https://www.cihbank.ma',
        adresse: 'Boulevard Hassan II, Casablanca, Maroc',
      },
      {
        nom: 'Bank of Africa',
        sigle: 'BOA',
        secteur: 'Secteur Bancaire',
        description: 'Groupe bancaire panafricain présent dans plus de 32 pays.',
        logo: '/images/logos/boa_logo.png',
        couleurPrimaire: '#0055A5',
        enteteRecu: 'Bank of Africa - Human Resources & Talent Acquisition',
        piedRecu: 'Certificat numérique de postulation. Conforme aux normes ACPR et CNDP.',
        siteWeb: 'https://www.bankofafrica.ma',
        adresse: 'Casablanca Finance City, Casablanca, Maroc',
      },
      {
        nom: 'Groupe OCP',
        sigle: 'OCP',
        secteur: 'Industrie & Mines',
        description: 'Leader mondial des produits phosphatés et de la chimie industrielle.',
        logo: '/images/logos/ocp_logo.png',
        couleurPrimaire: '#00875A',
        enteteRecu: 'Groupe OCP - Direction du Développement des Talents',
        piedRecu: 'Récépissé de candidature aux concours d’ingénieurs et techniciens OCP.',
        siteWeb: 'https://www.ocpgroup.ma',
        adresse: '2 Rue Al Abtal, Hay Erraha, Casablanca, Maroc',
      },
      {
        nom: "Ministère de l'Économie et des Finances",
        sigle: 'MEF',
        secteur: 'Concours Public / Ministère',
        description: 'Département gouvernemental en charge de la politique économique et financière de l’État.',
        logo: '/images/logos/mef_logo.png',
        couleurPrimaire: '#334155',
        enteteRecu: "Royaume du Maroc - Ministère de l'Économie et des Finances",
        piedRecu: 'Convocation et accusé officiel de dépôt de dossier de concours de la fonction publique.',
        siteWeb: 'https://www.finances.gov.ma',
        adresse: 'Quartier Administratif, Rabat Chellah, Maroc',
      },
      {
        nom: 'Caisse de Dépôt et de Gestion',
        sigle: 'CDG',
        secteur: 'Assurance & Finance',
        description: 'Institution financière publique au service du développement économique du Maroc.',
        logo: '/images/logos/cdg_logo.png',
        couleurPrimaire: '#D97706',
        enteteRecu: 'Groupe CDG - Direction des Ressources Humaines',
        piedRecu: 'Accusé de réception officiel de candidature Groupe CDG.',
        siteWeb: 'https://www.cdg.ma',
        adresse: 'Place Moulay El Hassan, Rabat, Maroc',
      },
    ];

    const savedEntreprises = {};

    for (const ent of entreprisesData) {
      let existing = await Entreprise.findOne({ sigle: ent.sigle });
      if (!existing) {
        existing = await Entreprise.create(ent);
        console.log(`+ Organisation créée : ${ent.nom} (${ent.sigle})`);
      } else {
        Object.assign(existing, ent);
        await existing.save();
        console.log(`✓ Organisation mise à jour : ${ent.nom}`);
      }
      savedEntreprises[ent.sigle] = existing;
    }

    // 2. CRÉATION D'OFFRES AVEC SCORING DYNAMIQUE DIFFÉRENCIÉ
    const sampleOffres = [
      {
        titre: 'Guichetiers Chargés d’Opérations & Accueil Clientèle',
        entreprise: savedEntreprises['ABB']._id,
        entrepriseNom: savedEntreprises['ABB'].nom,
        entrepriseSigle: savedEntreprises['ABB'].sigle,
        entrepriseLogo: savedEntreprises['ABB'].logo,
        entrepriseCouleur: savedEntreprises['ABB'].couleurPrimaire,
        secteur: 'Secteur Bancaire',
        ville: 'Réseau National (Toutes Régions)',
        niveau: 'Bac +2 / Bac +3',
        postes: 120,
        specialite: 'Réseau Agences Bancaires',
        statut: 'En cours',
        description: 'Assurer le service et les opérations de caisse et guichet pour la clientèle bancaire.',
        pdfUrl: '/uploads/Dossier_Candidat_Complet_6_Pages.pdf',
        // Barème Al Barid Bank (Critère fort sur l'âge et expérience bancaire)
        scoringRules: {
          maxScore: 100,
          age: {
            actif: true,
            poidsMax: 10,
            tranches: [
              { min: 18, max: 24, points: 10 },
              { min: 25, max: 27, points: 7 },
              { min: 28, max: 30, points: 4 },
              { min: 31, max: 40, points: 0 },
            ],
          },
          note: {
            actif: true,
            poidsMax: 40,
            modeCalcul: 'tranches',
            tranches: [
              { minNote: 16, points: 40 },
              { minNote: 15, points: 35 },
              { minNote: 14, points: 30 },
              { minNote: 13, points: 25 },
              { minNote: 12, points: 20 },
              { minNote: 10, points: 10 },
            ],
          },
          mention: {
            actif: false,
            poidsMax: 0,
            points: { tresBien: 0, bien: 0, assezBien: 0, passable: 0 },
          },
          experience: {
            actif: true,
            poidsMax: 30,
            nomSpecialite: 'Bancaire',
            pointsParMoisSpecialite: 0.625,
            pointsParMoisAutre: 0.15,
            maxMois: 48,
          },
          diplome: {
            actif: true,
            poidsMax: 20,
            pointsParNiveau: { bac2: 12, bac3: 20, bac5: 20 },
          },
        },
      },
      {
        titre: 'Chargés de Clientèle Particuliers & Professionnels',
        entreprise: savedEntreprises['CIH']._id,
        entrepriseNom: savedEntreprises['CIH'].nom,
        entrepriseSigle: savedEntreprises['CIH'].sigle,
        entrepriseLogo: savedEntreprises['CIH'].logo,
        entrepriseCouleur: savedEntreprises['CIH'].couleurPrimaire,
        secteur: 'Secteur Bancaire',
        ville: 'Casablanca, Rabat, Tanger',
        niveau: 'Bac +3 / Licence',
        postes: 25,
        specialite: 'Commercial & Gestion de Portefeuille',
        statut: 'En cours',
        description: 'Développer et fidéliser un portefeuille de clients particuliers et professionnels.',
        pdfUrl: '/uploads/Dossier_Candidat_Complet_6_Pages.pdf',
        // Barème CIH (Âge modéré, fort poids sur diplôme et note)
        scoringRules: {
          maxScore: 100,
          age: {
            actif: true,
            poidsMax: 10,
            tranches: [
              { min: 18, max: 26, points: 10 },
              { min: 27, max: 30, points: 5 },
              { min: 31, max: 45, points: 0 },
            ],
          },
          note: {
            actif: true,
            poidsMax: 35,
            modeCalcul: 'proportionnel',
            tranches: [],
          },
          mention: {
            actif: true,
            poidsMax: 15,
            points: { tresBien: 15, bien: 12, assezBien: 8, passable: 3 },
          },
          experience: {
            actif: true,
            poidsMax: 20,
            nomSpecialite: 'Bancaire',
            pointsParMoisSpecialite: 0.5,
            pointsParMoisAutre: 0.2,
            maxMois: 40,
          },
          diplome: {
            actif: true,
            poidsMax: 20,
            pointsParNiveau: { bac2: 10, bac3: 20, bac5: 20 },
          },
        },
      },
      {
        titre: 'Inspecteurs des Finances & Cadres d’Administration',
        entreprise: savedEntreprises['MEF']._id,
        entrepriseNom: savedEntreprises['MEF'].nom,
        entrepriseSigle: savedEntreprises['MEF'].sigle,
        entrepriseLogo: savedEntreprises['MEF'].logo,
        entrepriseCouleur: savedEntreprises['MEF'].couleurPrimaire,
        secteur: 'Concours Public / Ministère',
        ville: 'Rabat (Administration Centrale)',
        niveau: 'Bac +5 / Master / Ingénieur',
        postes: 50,
        specialite: 'Finances Publiques, Droit & Audit',
        statut: 'En cours',
        description: 'Concours officiel d’accès au grade d’Inspecteur des Finances 1er grade.',
        pdfUrl: '/uploads/Dossier_Candidat_Complet_6_Pages.pdf',
        // Barème Ministère (Scoring strict Fonction Publique : mention + note, expérience générale valorisée)
        scoringRules: {
          maxScore: 100,
          age: {
            actif: true,
            poidsMax: 15,
            tranches: [
              { min: 18, max: 28, points: 15 },
              { min: 29, max: 35, points: 8 },
              { min: 36, max: 45, points: 0 },
            ],
          },
          note: {
            actif: true,
            poidsMax: 35,
            modeCalcul: 'proportionnel',
            tranches: [],
          },
          mention: {
            actif: true,
            poidsMax: 20,
            points: { tresBien: 20, bien: 15, assezBien: 10, passable: 4 },
          },
          experience: {
            actif: true,
            poidsMax: 15,
            nomSpecialite: 'Public',
            pointsParMoisSpecialite: 0.5,
            pointsParMoisAutre: 0.4, // Toute expérience est valorisée
            maxMois: 36,
          },
          diplome: {
            actif: true,
            poidsMax: 15,
            pointsParNiveau: { bac2: 0, bac3: 5, bac5: 15 },
          },
        },
      },
      {
        titre: 'Ingénieurs d’Exploitation Industrielle & Procédés Chimiques',
        entreprise: savedEntreprises['OCP']._id,
        entrepriseNom: savedEntreprises['OCP'].nom,
        entrepriseSigle: savedEntreprises['OCP'].sigle,
        entrepriseLogo: savedEntreprises['OCP'].logo,
        entrepriseCouleur: savedEntreprises['OCP'].couleurPrimaire,
        secteur: 'Industrie & Mines',
        ville: 'Jorf Lasfar, Khouribga, Benguerir',
        niveau: 'Bac +5 / Ingénieur d’État',
        postes: 30,
        specialite: 'Génie Chimique, Électromécanique & Procédés',
        statut: 'En cours',
        description: 'Pilotage des installations chimiques et industrielles des plateformes de production OCP.',
        pdfUrl: '/uploads/Dossier_Candidat_Complet_6_Pages.pdf',
        // Barème OCP : Âge = 0 pt (pas de discrimination d'âge), poids très fort sur Ingénieur + Note
        scoringRules: {
          maxScore: 100,
          age: {
            actif: false, // OCP ne donne pas de points d'âge
            poidsMax: 0,
            tranches: [],
          },
          note: {
            actif: true,
            poidsMax: 40,
            modeCalcul: 'tranches',
            tranches: [
              { minNote: 16, points: 40 },
              { minNote: 15, points: 35 },
              { minNote: 14, points: 28 },
              { minNote: 12, points: 18 },
              { minNote: 10, points: 10 },
            ],
          },
          mention: {
            actif: true,
            poidsMax: 15,
            points: { tresBien: 15, bien: 12, assezBien: 8, passable: 0 },
          },
          experience: {
            actif: true,
            poidsMax: 25,
            nomSpecialite: 'Industrie',
            pointsParMoisSpecialite: 0.8,
            pointsParMoisAutre: 0.2,
            maxMois: 36,
          },
          diplome: {
            actif: true,
            poidsMax: 20,
            pointsParNiveau: { bac2: 0, bac3: 5, bac5: 20 },
          },
        },
      },
    ];

    for (const off of sampleOffres) {
      let existingOffre = await Offre.findOne({ titre: off.titre });
      if (!existingOffre) {
        await Offre.create(off);
        console.log(`+ Offre créée : ${off.titre} (${off.entrepriseSigle})`);
      } else {
        Object.assign(existingOffre, off);
        await existingOffre.save();
        console.log(`✓ Offre mise à jour avec barème : ${off.titre} (${off.entrepriseSigle})`);
      }
    }

    console.log('✅ Seeding multi-entreprises et barèmes dynamiques terminé avec succès !');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur lors du seeding :', err);
    process.exit(1);
  }
};

seedData();
