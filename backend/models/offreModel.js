import mongoose from 'mongoose';

const scoringRulesSchema = mongoose.Schema(
  {
    maxScore: {
      type: Number,
      default: 100,
    },
    // CRITÈRE 1: ÂGE (Ex: 7 pts pour une administration, 10 pour une autre, 0 si désactivé)
    age: {
      actif: { type: Boolean, default: true },
      poidsMax: { type: Number, default: 10 },
      tranches: [
        {
          min: { type: Number, required: true },
          max: { type: Number, required: true },
          points: { type: Number, required: true },
        },
      ],
    },
    // CRITÈRE 2: NOTE / MOYENNE (Palier ou proportionnel)
    note: {
      actif: { type: Boolean, default: true },
      poidsMax: { type: Number, default: 40 },
      modeCalcul: {
        type: String,
        enum: ['tranches', 'proportionnel'],
        default: 'tranches',
      },
      tranches: [
        {
          minNote: { type: Number, required: true },
          points: { type: Number, required: true },
        },
      ],
    },
    // CRITÈRE 3: MENTION DU DIPLÔME
    mention: {
      actif: { type: Boolean, default: false },
      poidsMax: { type: Number, default: 20 },
      points: {
        tresBien: { type: Number, default: 20 },
        bien: { type: Number, default: 15 },
        assezBien: { type: Number, default: 10 },
        passable: { type: Number, default: 5 },
      },
    },
    // CRITÈRE 4: EXPÉRIENCE PROFESSIONNELLE (Bancaire, Industrielle, Publique ou Générale)
    experience: {
      actif: { type: Boolean, default: true },
      poidsMax: { type: Number, default: 30 },
      nomSpecialite: { type: String, default: 'Bancaire' },
      pointsParMoisSpecialite: { type: Number, default: 0.5 },
      pointsParMoisAutre: { type: Number, default: 0.15 },
      maxMois: { type: Number, default: 48 },
    },
    // CRITÈRE 5: NIVEAU D'ÉTUDES / DIPLÔME
    diplome: {
      actif: { type: Boolean, default: true },
      poidsMax: { type: Number, default: 20 },
      pointsParNiveau: {
        bac2: { type: Number, default: 10 },
        bac3: { type: Number, default: 15 },
        bac5: { type: Number, default: 20 },
      },
    },
  },
  { _id: false }
);

const offreSchema = mongoose.Schema(
  {
    titre: {
      type: String,
      required: [true, 'Veuillez indiquer le titre du poste'],
      trim: true,
    },
    entreprise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Entreprise',
    },
    entrepriseNom: {
      type: String,
      default: 'Al Barid Bank',
    },
    entrepriseSigle: {
      type: String,
      default: 'ABB',
    },
    entrepriseLogo: {
      type: String,
      default: '',
    },
    entrepriseCouleur: {
      type: String,
      default: '#003366',
    },
    secteur: {
      type: String,
      default: 'Secteur Bancaire',
    },
    ville: {
      type: String,
      default: 'Réseau National',
    },
    niveau: {
      type: String,
      default: 'Bac +2 / Bac +3',
    },
    postes: {
      type: Number,
      default: 1,
    },
    specialite: {
      type: String,
      default: 'Réseau Agences Bancaires',
    },
    statut: {
      type: String,
      enum: ['En cours', 'Clôturé'],
      default: 'En cours',
    },
    description: {
      type: String,
      default: '',
    },
    profilRecherche: {
      type: String,
      default: '',
    },
    dateLimite: {
      type: Date,
    },
    pdfUrl: {
      type: String,
      default: '',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // MOTEUR DE SCORING DYNAMIQUE
    scoringRules: {
      type: scoringRulesSchema,
      default: () => ({
        maxScore: 100,
        age: {
          actif: true,
          poidsMax: 10,
          tranches: [
            { min: 18, max: 24, points: 10 },
            { min: 25, max: 28, points: 7 },
            { min: 29, max: 32, points: 4 },
            { min: 33, max: 45, points: 0 },
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
          poidsMax: 20,
          points: {
            tresBien: 20,
            bien: 15,
            assezBien: 10,
            passable: 5,
          },
        },
        experience: {
          actif: true,
          poidsMax: 30,
          nomSpecialite: 'Bancaire',
          pointsParMoisSpecialite: 0.625,
          pointsParMoisAutre: 0.2,
          maxMois: 48,
        },
        diplome: {
          actif: true,
          poidsMax: 20,
          pointsParNiveau: {
            bac2: 10,
            bac3: 15,
            bac5: 20,
          },
        },
      }),
    },
  },
  {
    timestamps: true,
  }
);

const Offre = mongoose.model('Offre', offreSchema);

export default Offre;
