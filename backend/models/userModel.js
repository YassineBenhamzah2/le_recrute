import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const userSchema = mongoose.Schema(
  {
    //INFORMATIONS PERSONNELLES DE L'UTILISATEUR
    civilite: {
      type: String,
      enum: ['Monsieur', 'Madame'],
    },
    prenom: {
      type: String,
      required: [true, 'Veuillez entrer votre prenom'],
    },
    nom: {
      type: String,
      required: [true, 'Veuillez entrer votre nom'],
    },
    dateNaissance: {
      type: String,
    },
    lieuNaissance: {
      type: String,
    },
    email: {
      type: String,
      required: [true, 'Veuillez enter votre email'],
    },
    mdp: {
      type: String,
      required: [true, 'Veuillez entrer votre mot de passe'],
    },
    cni: {
      type: String,
    },
    dateObtentionBac: {
      type: Date,
      required: true,
    },
    nationalite: {
      type: String,
    },
    phone: {
      type: String,
    },
    adresse: {
      type: String,
    },
    ville: {
      type: String,
    },
    codePostale: {
      type: String,
    },
    scoreAge: {
      type: Number,
    },
    copieCNI: { type: String },
    residence: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    isController: {
      type: Boolean,
      required: true,
      default: false,
    },
    isMaitreOuvrage: {
      type: Boolean,
      required: true,
      default: false,
    },
    entreprise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Entreprise',
    },

    // resetPasswordToken: String,
    // resetPasswordExpire: Date,
  },

  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.mdp);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('mdp')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.mdp = await bcrypt.hash(this.mdp, salt);
});

// // Generate and hash password token
// userSchema.methods.getResetPasswordToken = function () {
//   // Hash token and set to resetPasswordToken field
//   const resetToken = generateToken(this._id);
//   (this.resetPasswordToken = generateToken(this._id)),
//     // Set expire
//     (this.resetPasswordExpire = Date.now() + 10 * 60 * 1000);

//   return resetToken;
// };

const User = mongoose.model('User', userSchema);

export default User;
