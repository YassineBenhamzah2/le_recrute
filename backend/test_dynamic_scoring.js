import { calculateDynamicScore } from './utils/dynamicScoringEngine.js';

// Candidat Test : 23 ans, Licence (Bac+3), Moyenne 15.5/20, Mention Bien, 12 mois expérience bancaire
const candidate = {
  niveauEtude: 'Bac+3',
  specialite: 'Banque et Finance',
  diplome: 'Licence Professionnelle Bancaire',
  mention: 'Bien',
  methodeNotation: 'Semestres',
  semestre1: 15,
  semestre2: 16,
  semestre3: 15,
  semestre4: 16,
  semestre5: 15,
  semestre6: 16,
  experiences: [
    {
      domaine: 'Bancaire',
      fonctionOccupee: 'Stagiaire Chargé d’Accueil',
      entreprise: 'CIH Bank',
      dateDebut: '2023-01-01',
      dateFin: '2024-01-01',
    },
  ],
};

const user = {
  // Né il y a 23 ans
  dateNaissance: '2003-05-15',
};

// 1. Barème Al Barid Bank (Focus Âge + Expérience bancaire)
const baremeABB = {
  maxScore: 100,
  age: {
    actif: true,
    poidsMax: 10,
    tranches: [
      { min: 18, max: 24, points: 10 },
      { min: 25, max: 28, points: 7 },
      { min: 29, max: 35, points: 0 },
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
      { minNote: 12, points: 20 },
    ],
  },
  mention: { actif: false, poidsMax: 0, points: {} },
  experience: {
    actif: true,
    poidsMax: 30,
    nomSpecialite: 'Bancaire',
    pointsParMoisSpecialite: 0.625,
    pointsParMoisAutre: 0.1,
    maxMois: 48,
  },
  diplome: {
    actif: true,
    poidsMax: 20,
    pointsParNiveau: { bac2: 10, bac3: 20, bac5: 20 },
  },
};

// 2. Barème Ministère des Finances (Fonction Publique : Âge 15 pts, Mention 20 pts, Note proportionnelle 35 pts)
const baremeMEF = {
  maxScore: 100,
  age: {
    actif: true,
    poidsMax: 15,
    tranches: [
      { min: 18, max: 25, points: 15 },
      { min: 26, max: 30, points: 10 },
      { min: 31, max: 35, points: 5 },
    ],
  },
  note: {
    actif: true,
    poidsMax: 35,
    modeCalcul: 'proportionnel',
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
    pointsParMoisAutre: 0.4,
    maxMois: 36,
  },
  diplome: {
    actif: true,
    poidsMax: 15,
    pointsParNiveau: { bac2: 0, bac3: 10, bac5: 15 },
  },
};

// 3. Barème Groupe OCP (Âge désactivé = 0 pt, priorité absolue sur ingénierie et note)
const baremeOCP = {
  maxScore: 100,
  age: {
    actif: false, // 0 point pour l'âge
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
};

console.log('=== TEST 1 : POSTULATION AL BARID BANK ===');
const scoreABB = calculateDynamicScore(candidate, user, baremeABB);
console.log('Score Total ABB :', scoreABB.scoreTotal, '/ 100');
console.log('Détails ABB :', scoreABB.details);

console.log('\n=== TEST 2 : POSTULATION MINISTÈRE DES FINANCES ===');
const scoreMEF = calculateDynamicScore(candidate, user, baremeMEF);
console.log('Score Total MEF :', scoreMEF.scoreTotal, '/ 100');
console.log('Détails MEF :', scoreMEF.details);

console.log('\n=== TEST 3 : POSTULATION GROUPE OCP (Âge = 0 pt) ===');
const scoreOCP = calculateDynamicScore(candidate, user, baremeOCP);
console.log('Score Total OCP :', scoreOCP.scoreTotal, '/ 100');
console.log('Détails OCP :', scoreOCP.details);
