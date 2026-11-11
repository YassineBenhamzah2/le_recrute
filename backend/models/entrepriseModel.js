import mongoose from 'mongoose';

const entrepriseSchema = mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, "Veuillez renseigner le nom de l'organisation"],
      trim: true,
      unique: true,
    },
    sigle: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    secteur: {
      type: String,
      required: true,
      enum: [
        'Secteur Bancaire',
        'Concours Public / Ministère',
        'Industrie & Mines',
        'Assurance & Finance',
        'Autre',
      ],
      default: 'Secteur Bancaire',
    },
    description: {
      type: String,
      default: '',
    },
    logo: {
      type: String,
      default: '/images/logos/default_org.png',
    },
    logoRecu: {
      type: String,
      default: '',
    },
    couleurPrimaire: {
      type: String,
      default: '#003366',
    },
    enteteRecu: {
      type: String,
      default: 'Royaume du Maroc - Portail National de Recrutement',
    },
    piedRecu: {
      type: String,
      default:
        'Ce document officiel fait foi de dépôt de candidature. Conforme à la loi 09-08 (CNDP).',
    },
    siteWeb: {
      type: String,
      default: '',
    },
    adresse: {
      type: String,
      default: 'Maroc',
    },
    actif: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Entreprise = mongoose.model('Entreprise', entrepriseSchema);

export default Entreprise;
