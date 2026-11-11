import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from './models/userModel.js';
import Entreprise from './models/entrepriseModel.js';
import Offre from './models/offreModel.js';

dotenv.config();
dotenv.config({ path: path.resolve('backend', '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/recrutement_ccp';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connecte pour initialisation globale...');

    // 1. CREER OU METTRE A JOUR LE COMPTE ADMIN
    const adminEmail = 'admin@gmail.com';
    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      admin = new User({
        civilite: 'Monsieur',
        prenom: 'Admin',
        nom: 'System',
        email: adminEmail,
        mdp: '12345678', // Mot de passe par défaut
        cni: 'AB123456',
        dateObtentionBac: new Date('2015-06-20'),
        isAdmin: true,
        isController: false,
        isMaitreOuvrage: false,
      });
      await admin.save();
      console.log(`[OK] Compte Admin cree avec succes : ${adminEmail} (Mot de passe: 12345678)`);
    } else {
      admin.isAdmin = true;
      admin.mdp = '12345678';
      await admin.save();
      console.log(`[OK] Compte Admin mis a jour : ${adminEmail} (Mot de passe: 12345678)`);
    }

    // 2. CREER UN COMPTE CONTROLEUR TEST
    const controllerEmail = 'controlleur@gmail.com';
    let controller = await User.findOne({ email: controllerEmail });
    if (!controller) {
      controller = new User({
        civilite: 'Monsieur',
        prenom: 'Staff',
        nom: 'Controleur',
        email: controllerEmail,
        mdp: '12345678',
        cni: 'CT999888',
        dateObtentionBac: new Date('2016-06-20'),
        isAdmin: false,
        isController: true,
        isMaitreOuvrage: false,
      });
      await controller.save();
      console.log(`[OK] Compte Controleur cree : ${controllerEmail} (Mot de passe: 12345678)`);
    }

    console.log('Base de donnees initialisee avec succes !');
    process.exit(0);
  } catch (err) {
    console.error('Erreur lors de l initialisation :', err);
    process.exit(1);
  }
};

seedDatabase();
