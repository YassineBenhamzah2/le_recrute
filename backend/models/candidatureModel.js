import mongoose from 'mongoose';

const candidatureSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    niveauEtude: {
      type: String,
      required: [true, "Veuillez indiquer votre niveau d'etude"],
    },
    specialite: {
      type: String,
      required: [true, "Veuillez indiquer votre specialite"],
    },
    diplome: {
      type: String,
      required: [true, 'Veuillez indiquer votre diplome'],
    },
    mention: {
      type: String,
      required: [true, 'Veuillez indiquer votre mention'],
    },
    dateObtention: {
      type: Date,
      required: true,
    },
    etablissement: {
      type: String,
      required: true,
    },
    methodeNotation: {
      type: String,
      default: 'Annees',
    },
    annee1: {
      type: Number,
      default: 0,
    },
    annee2: {
      type: Number,
      default: 0,
    },
    annee3: {
      type: Number,
      default: 0,
    },
    semestre1: {
      type: Number,
      default: 0,
    },
    semestre2: {
      type: Number,
      default: 0,
    },
    semestre3: {
      type: Number,
      default: 0,
    },
    semestre4: {
      type: Number,
      default: 0,
    },
    semestre5: {
      type: Number,
      default: 0,
    },
    semestre6: {
      type: Number,
      default: 0,
    },
    semestre6: {
      type: Number,
      default: 0,
    },
    moyenneOFFPT: {
      type: Number,
      default: 0,
    },
    situationActuelle: {
      type: String,
      enum: ['En poste', 'Recherche emploi', 'Fonctionnaire'],
      required: true,
    },
    disponibilite: {
      type: String,
      enum: ['Immediate', 'Dans un mois', 'Dans deux mois'],
      required: true,
    },
    experiences: [
      {
        domaine: {
          type: String,
          required: true,
          default: 'Spécialité directe',
        },
        fonctionOccupee: {
          type: String,
          required: true,
        },
        entreprise: {
          type: String,
          required: true,
        },
        dateDebut: {
          type: String,
          required: true,
        },
        dateFin: {
          type: String,
          required: true,
        },
        enPoste: {
          type: Boolean,
          default: false,
        },
      },
    ],
    offre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offre',
    },
    entreprise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Entreprise',
    },
    numeroDossier: {
      type: String,
      unique: true,
      sparse: true,
    },
    poste: {
      type: String,
    },
    scoreAge: {
      type: Number,
      default: 0,
    },
    scoreNote: {
      type: Number,
      default: 0,
    },
    scoreMention: {
      type: Number,
      default: 0,
    },
    scoreExperience: {
      type: Number,
      default: 0,
    },
    scoreExperienceBancaire: {
      type: Number,
      default: 0,
    },
    scoreDiplome: {
      type: Number,
      default: 0,
    },
    scoreTotal: {
      type: Number,
      default: 0,
    },
    scoreDetails: [
      {
        type: String,
      },
    ],
    controle1: {
      type: String,
    },
    controle2: {
      type: String,
    },
    isControl1: {
      type: Boolean,
      required: true,
      default: false,
    },
    isControl2: {
      type: Boolean,
      required: true,
      default: false,
    },
    conforme: {
      type: String,
      enum: ['CONFORME', 'NON CONFORME'],
    },
    eligibilite: {
      type: String,
      enum: ['ELIGIBLE', 'NON ELIGIBLE'],
    },
    motif: {
      type: 'String',
      enum: ['NENA', 'NEA', 'NED', 'NEP'],
    },
    dossier: {
      type: String,
      enum: ['NEP-CIN', 'NEP-AR', 'NEP-DIP', 'NEP-AE', 'NEP-RN', 'NEP-AT'],
    },
    releves: {
      type: String,
    },
    copieDiplomes: {
      type: String,
    },
    attestationsTravail: { type: String },
  },
  { timestamps: true }
);

const Candidature = mongoose.model('Candidature', candidatureSchema);

export default Candidature;
