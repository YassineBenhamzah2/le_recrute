import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import User from './models/userModel.js';
import Entreprise from './models/entrepriseModel.js';
import Offre from './models/offreModel.js';
import Candidature from './models/candidatureModel.js';

dotenv.config();
dotenv.config({ path: path.resolve('backend', '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/recrutement_ccp';

const runTestScenario = async () => {
  try {
    console.log('Connexion a MongoDB pour le scenario de test...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('[OK] Connecte a MongoDB !');

    const defaultPassword = 'Password123!';

    // =========================================================================
    // 1. CRÉATION DE L'ENTREPRISE (Logo, Sigle, Nom, Couleurs, Récépissé CNDP)
    // =========================================================================
    const entrepriseData = {
      nom: 'Bank of Africa - BMCE Group',
      sigle: 'BOA',
      secteur: 'Secteur Bancaire',
      description: 'Groupe bancaire panafricain de référence, engagé dans l’innovation financière et la bancarisation moderne.',
      logo: '/images/logos/boa_logo.png',
      couleurPrimaire: '#0055A5',
      enteteRecu: 'Bank of Africa - Direction du Capital Humain & Recrutement',
      piedRecu: 'Récépissé officiel de postulation. Certifié conforme à la loi 09-08 (CNDP).',
      siteWeb: 'https://www.bankofafrica.ma',
      adresse: 'Casablanca Finance City, Tour BMCE, Casablanca, Maroc',
      actif: true,
    };

    let entreprise = await Entreprise.findOne({ sigle: entrepriseData.sigle });
    if (!entreprise) {
      entreprise = await Entreprise.create(entrepriseData);
      console.log(`[OK] Entreprise creee : ${entreprise.nom} (${entreprise.sigle})`);
    } else {
      Object.assign(entreprise, entrepriseData);
      await entreprise.save();
      console.log(`[OK] Entreprise mise a jour : ${entreprise.nom} (${entreprise.sigle})`);
    }

    // =========================================================================
    // 2. CRÉATION DU COMPTE RH (Maître d'Ouvrage)
    // =========================================================================
    const rhEmail = 'rh.boa@recrutement.ma';
    let rhUser = await User.findOne({ email: rhEmail });
    const rhData = {
      civilite: 'Madame',
      prenom: 'Siham',
      nom: 'Benjelloun',
      email: rhEmail,
      mdp: defaultPassword,
      cni: 'BK543210',
      phone: '0661998877',
      dateNaissance: '1988-04-12',
      lieuNaissance: 'Casablanca',
      dateObtentionBac: new Date('2006-06-20'),
      adresse: 'Boulevard d’Anfa, Casablanca',
      ville: 'Casablanca',
      codePostale: '20000',
      isAdmin: false,
      isController: false,
      isMaitreOuvrage: true,
      entreprise: entreprise._id,
    };

    if (!rhUser) {
      rhUser = await User.create(rhData);
      console.log(`[OK] Compte RH cree : ${rhEmail} (Password: ${defaultPassword})`);
    } else {
      rhUser.isMaitreOuvrage = true;
      rhUser.entreprise = entreprise._id;
      rhUser.mdp = defaultPassword;
      await rhUser.save();
      console.log(`[OK] Compte RH mis a jour : ${rhEmail} (Password: ${defaultPassword})`);
    }

    // =========================================================================
    // 3. CRÉATION DE L'OFFRE DE RECRUTEMENT AVEC BARÈME OFFICIEL DYNAMIQUE
    // =========================================================================
    const offreData = {
      titre: 'Chargés de Clientèle Particuliers & Professionnels',
      entreprise: entreprise._id,
      entrepriseNom: entreprise.nom,
      entrepriseSigle: entreprise.sigle,
      entrepriseLogo: entreprise.logo,
      entrepriseCouleur: entreprise.couleurPrimaire,
      secteur: 'Secteur Bancaire',
      ville: 'Casablanca, Rabat, Tanger, Marrakech',
      niveau: 'Bac +3 / Bac +5',
      postes: 25,
      specialite: 'Banque, Finance, Gestion, Économie',
      statut: 'En cours',
      description: 'Dans le cadre de l’expansion de notre réseau d’agences, nous recrutons des Chargés de Clientèle pour développer et fidéliser un portefeuille de clients particuliers et professionnels.',
      profilRecherche: 'Titulaire d’un Bac+3 ou Bac+5 en Finance, Économie, Banque ou Gestion. Aisance relationnelle, rigueur et orientation résultat.',
      dateLimite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Dans 30 jours
      user: rhUser._id,
      scoringRules: {
        maxScore: 100,
        age: {
          actif: true,
          poidsMax: 10,
          tranches: [
            { min: 20, max: 25, points: 10 },
            { min: 26, max: 30, points: 8 },
            { min: 31, max: 35, points: 5 },
          ],
        },
        note: {
          actif: true,
          poidsMax: 30,
          modeCalcul: 'tranches',
          tranches: [
            { minNote: 16, points: 30 },
            { minNote: 14, points: 24 },
            { minNote: 12, points: 18 },
            { minNote: 10, points: 10 },
          ],
        },
        mention: {
          actif: true,
          poidsMax: 20,
          points: {
            tresBien: 20,
            bien: 16,
            assezBien: 12,
            passable: 6,
          },
        },
        experience: {
          actif: true,
          poidsMax: 25,
          nomSpecialite: 'Bancaire',
          pointsParMoisSpecialite: 0.6,
          pointsParMoisAutre: 0.2,
          maxMois: 42,
        },
        diplome: {
          actif: true,
          poidsMax: 15,
          pointsParNiveau: {
            bac2: 8,
            bac3: 12,
            bac5: 15,
          },
        },
      },
    };

    let offre = await Offre.findOne({ titre: offreData.titre, entrepriseSigle: 'BOA' });
    if (!offre) {
      offre = await Offre.create(offreData);
      console.log(`[OK] Offre creee : "${offre.titre}" (25 postes - BOA)`);
    } else {
      Object.assign(offre, offreData);
      await offre.save();
      console.log(`[OK] Offre mise a jour : "${offre.titre}"`);
    }

    // =========================================================================
    // 4. CRÉATION DES 6 COMPTES CANDIDATS & LEURS DOSSIERS DÉTAILLÉS
    // =========================================================================
    const candidatsSeed = [
      {
        civilite: 'Monsieur',
        prenom: 'Yassine',
        nom: 'Amrani',
        email: 'candidat1.yassine@gmail.com',
        cni: 'BE892110',
        phone: '0612345671',
        dateNaissance: '1998-05-15', // 28 ans -> 8 pts age
        lieuNaissance: 'Casablanca',
        dateObtentionBac: new Date('2016-06-20'),
        ville: 'Casablanca',
        codePostale: '20100',
        dossier: {
          niveauEtude: 'Bac +5',
          specialite: 'Audit & Finance de Marché',
          diplome: "Diplôme de l'ENCG Casablanca (Master Spécialisé)",
          mention: 'Très Bien',
          etablissement: 'ENCG Casablanca',
          dateObtention: new Date('2021-07-10'),
          moyenneOFFPT: 16.4,
          situationActuelle: 'En poste',
          disponibilite: 'Dans un mois',
          experiences: [
            {
              domaine: 'Spécialité directe',
              fonctionOccupee: 'Conseiller Clientèle Professionnels',
              entreprise: 'Attijariwafa Bank',
              dateDebut: '2022-01-01',
              dateFin: '2026-11-12',
              enPoste: true,
            },
          ],
          scoreAge: 8,
          scoreDiplome: 15,
          scoreMention: 20,
          scoreNote: 30,
          scoreExperience: 25,
          scoreTotal: 98,
          eligibilite: 'ELIGIBLE',
          conforme: 'CONFORME',
        },
      },
      {
        civilite: 'Madame',
        prenom: 'Fatima-Zahra',
        nom: 'Bennani',
        email: 'candidat2.fatima@gmail.com',
        cni: 'CD451299',
        phone: '0612345672',
        dateNaissance: '2001-03-22', // 25 ans -> 10 pts age
        lieuNaissance: 'Fès',
        dateObtentionBac: new Date('2019-06-20'),
        ville: 'Rabat',
        codePostale: '10000',
        dossier: {
          niveauEtude: 'Bac +5',
          specialite: 'Ingénierie Financière',
          diplome: "Master d'Université ISCAE",
          mention: 'Bien',
          etablissement: 'ISCAE Rabat',
          dateObtention: new Date('2024-06-25'),
          moyenneOFFPT: 14.8,
          situationActuelle: 'En poste',
          disponibilite: 'Immediate',
          experiences: [
            {
              domaine: 'Spécialité directe',
              fonctionOccupee: 'Analyste Crédit Junior',
              entreprise: 'CIH Bank',
              dateDebut: '2024-09-01',
              dateFin: '2026-11-12',
              enPoste: true,
            },
          ],
          scoreAge: 10,
          scoreDiplome: 15,
          scoreMention: 16,
          scoreNote: 24,
          scoreExperience: 16,
          scoreTotal: 81,
          eligibilite: 'ELIGIBLE',
          conforme: 'CONFORME',
        },
      },
      {
        civilite: 'Monsieur',
        prenom: 'Mehdi',
        nom: 'Chraibi',
        email: 'candidat3.mehdi@gmail.com',
        cni: 'AB991823',
        phone: '0612345673',
        dateNaissance: '1999-11-08', // 27 ans -> 8 pts age
        lieuNaissance: 'Marrakech',
        dateObtentionBac: new Date('2017-06-20'),
        ville: 'Marrakech',
        codePostale: '40000',
        dossier: {
          niveauEtude: 'Bac +5',
          specialite: 'Banque & Assurance',
          diplome: 'Master Économie & Gestion',
          mention: 'Assez Bien',
          etablissement: 'Université Cadi Ayyad',
          dateObtention: new Date('2022-06-30'),
          moyenneOFFPT: 13.5,
          situationActuelle: 'Recherche emploi',
          disponibilite: 'Immediate',
          experiences: [
            {
              domaine: 'Spécialité directe',
              fonctionOccupee: 'Chargé d’Accueil & Opérations Guichet',
              entreprise: 'Al Barid Bank',
              dateDebut: '2022-09-01',
              dateFin: '2024-10-31',
              enPoste: false,
            },
          ],
          scoreAge: 8,
          scoreDiplome: 15,
          scoreMention: 12,
          scoreNote: 18,
          scoreExperience: 15,
          scoreTotal: 68,
          eligibilite: 'ELIGIBLE',
          conforme: 'CONFORME',
        },
      },
      {
        civilite: 'Madame',
        prenom: 'Salma',
        nom: 'Idrissi',
        email: 'candidat4.salma@gmail.com',
        cni: 'EE771234',
        phone: '0612345674',
        dateNaissance: '2002-08-14', // 24 ans -> 10 pts age
        lieuNaissance: 'Tanger',
        dateObtentionBac: new Date('2020-06-20'),
        ville: 'Tanger',
        codePostale: '90000',
        dossier: {
          niveauEtude: 'Bac +3',
          specialite: 'Management & Relations Clients',
          diplome: 'Licence Professionnelle Métiers de la Banque',
          mention: 'Bien',
          etablissement: 'FSJES Tanger',
          dateObtention: new Date('2023-06-20'),
          moyenneOFFPT: 14.2,
          situationActuelle: 'En poste',
          disponibilite: 'Immediate',
          experiences: [
            {
              domaine: 'Spécialité directe',
              fonctionOccupee: 'Guichetière Principale',
              entreprise: 'Crédit du Maroc',
              dateDebut: '2023-09-01',
              dateFin: '2026-11-12',
              enPoste: true,
            },
          ],
          scoreAge: 10,
          scoreDiplome: 12,
          scoreMention: 16,
          scoreNote: 24,
          scoreExperience: 18,
          scoreTotal: 80,
          eligibilite: 'ELIGIBLE',
          conforme: 'CONFORME',
        },
      },
      {
        civilite: 'Madame',
        prenom: 'Houda',
        nom: 'Alami',
        email: 'candidat5.houda@gmail.com',
        cni: 'JK112233',
        phone: '0612345675',
        dateNaissance: '2000-01-19', // 26 ans -> 8 pts age
        lieuNaissance: 'Rabat',
        dateObtentionBac: new Date('2018-06-20'),
        ville: 'Rabat',
        codePostale: '10050',
        dossier: {
          niveauEtude: 'Bac +5',
          specialite: 'Marketing Digital & Services Financiers',
          diplome: 'Master Spécialisé en Gestion',
          mention: 'Bien',
          etablissement: 'Université Mohammed V Rabat',
          dateObtention: new Date('2023-07-05'),
          moyenneOFFPT: 14.5,
          situationActuelle: 'Recherche emploi',
          disponibilite: 'Immediate',
          experiences: [
            {
              domaine: 'Autre domaine',
              fonctionOccupee: 'Chargée de Campagnes Digitales',
              entreprise: 'FinTech Maroc Solutions',
              dateDebut: '2023-10-01',
              dateFin: '2025-05-30',
              enPoste: false,
            },
          ],
          scoreAge: 8,
          scoreDiplome: 15,
          scoreMention: 16,
          scoreNote: 24,
          scoreExperience: 8,
          scoreTotal: 71,
          eligibilite: 'ELIGIBLE',
          conforme: 'CONFORME',
        },
      },
      {
        civilite: 'Monsieur',
        prenom: 'Karim',
        nom: 'Tazi',
        email: 'candidat6.karim@gmail.com',
        cni: 'FA882311',
        phone: '0612345676',
        dateNaissance: '2003-09-05', // 23 ans -> 10 pts age
        lieuNaissance: 'Casablanca',
        dateObtentionBac: new Date('2021-06-20'),
        ville: 'Casablanca',
        codePostale: '20250',
        dossier: {
          niveauEtude: 'Bac +2',
          specialite: 'Technicien Spécialisé en Gestion des Entreprises',
          diplome: 'DTS Gestion des Entreprises (OFPPT)',
          mention: 'Passable',
          etablissement: 'ISTA Polo Casablanca',
          dateObtention: new Date('2023-06-25'),
          moyenneOFFPT: 11.2,
          situationActuelle: 'Recherche emploi',
          disponibilite: 'Immediate',
          experiences: [
            {
              domaine: 'Spécialité directe',
              fonctionOccupee: 'Stagiaire Assistant Commercial',
              entreprise: 'Agence d’Assurance',
              dateDebut: '2024-01-15',
              dateFin: '2024-06-15',
              enPoste: false,
            },
          ],
          scoreAge: 10,
          scoreDiplome: 8,
          scoreMention: 6,
          scoreNote: 10,
          scoreExperience: 4,
          scoreTotal: 38,
          eligibilite: 'ELIGIBLE',
          conforme: 'CONFORME',
        },
      },
    ];

    console.log('\n--- Generation des 6 Candidats et leurs Candidatures ---');
    for (let i = 0; i < candidatsSeed.length; i++) {
      const cData = candidatsSeed[i];
      let user = await User.findOne({ email: cData.email });
      if (!user) {
        user = await User.create({
          civilite: cData.civilite,
          prenom: cData.prenom,
          nom: cData.nom,
          email: cData.email,
          mdp: defaultPassword,
          cni: cData.cni,
          phone: cData.phone,
          dateNaissance: cData.dateNaissance,
          lieuNaissance: cData.lieuNaissance,
          dateObtentionBac: cData.dateObtentionBac,
          ville: cData.ville,
          codePostale: cData.codePostale,
          isAdmin: false,
          isController: false,
          isMaitreOuvrage: false,
        });
      } else {
        user.mdp = defaultPassword;
        await user.save();
      }

      // Candidature
      const numDossier = `DOS-2026-BOA-00${i + 1}`;
      let cand = await Candidature.findOne({ numeroDossier: numDossier });
      const d = cData.dossier;

      const candPayload = {
        user: user._id,
        offre: offre._id,
        entreprise: entreprise._id,
        numeroDossier: numDossier,
        poste: offre.titre,
        niveauEtude: d.niveauEtude,
        specialite: d.specialite,
        diplome: d.diplome,
        mention: d.mention,
        dateObtention: d.dateObtention,
        etablissement: d.etablissement,
        moyenneOFFPT: d.moyenneOFFPT,
        situationActuelle: d.situationActuelle,
        disponibilite: d.disponibilite,
        experiences: d.experiences,
        scoreAge: d.scoreAge,
        scoreDiplome: d.scoreDiplome,
        scoreMention: d.scoreMention,
        scoreNote: d.scoreNote,
        scoreExperience: d.scoreExperience,
        scoreTotal: d.scoreTotal,
        eligibilite: d.eligibilite,
        conforme: d.conforme,
        isControl1: true,
        isControl2: true,
        controle1: 'VALIDE_AUDITEUR_1',
        controle2: 'VALIDE_COMMISSION_CENTRALE',
        scoreDetails: [
          `Diplôme: ${d.scoreDiplome}/15 pts`,
          `Mention: ${d.scoreMention}/20 pts`,
          `Note: ${d.scoreNote}/30 pts`,
          `Expérience: ${d.scoreExperience}/25 pts`,
          `Âge: ${d.scoreAge}/10 pts`,
        ],
      };

      if (!cand) {
        cand = await Candidature.create(candPayload);
        console.log(`[CANDIDAT ${i + 1}] ${user.prenom} ${user.nom} -> Score: ${d.scoreTotal}/100 [${numDossier}]`);
      } else {
        Object.assign(cand, candPayload);
        await cand.save();
        console.log(`[CANDIDAT ${i + 1}] ${user.prenom} ${user.nom} -> Score maj: ${d.scoreTotal}/100 [${numDossier}]`);
      }
    }

    console.log('\n=============================================================');
    console.log('   🎉 SCENARIO DE TEST CREE AVEC SUCCES DANS MONGODB !');
    console.log('=============================================================');
    console.log(`🏢 ENTREPRISE : ${entreprise.nom} (${entreprise.sigle})`);
    console.log(`💼 OFFRE      : "${offre.titre}" (25 Postes)`);
    console.log(`🔑 COMPTE RH  : ${rhEmail} / Password123!`);
    console.log(`👥 CANDIDATS  : 6 comptes crees avec scores de 38 a 98/100`);
    console.log('   - candidat1.yassine@gmail.com / Password123! (Score: 98/100 - Top 1)');
    console.log('   - candidat2.fatima@gmail.com  / Password123! (Score: 81/100 - Top 2)');
    console.log('   - candidat3.mehdi@gmail.com   / Password123! (Score: 68/100)');
    console.log('   - candidat4.salma@gmail.com   / Password123! (Score: 80/100)');
    console.log('   - candidat5.houda@gmail.com   / Password123! (Score: 71/100)');
    console.log('   - candidat6.karim@gmail.com   / Password123! (Score: 38/100)');
    console.log('=============================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Erreur lors de l execution du scenario :', err);
    process.exit(1);
  }
};

runTestScenario();
