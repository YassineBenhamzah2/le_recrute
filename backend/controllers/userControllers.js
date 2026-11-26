import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import { controleAge } from '../utils/controleCondidat.js';
import generateToken from '../utils/generateToken.js';
import { sendEmail } from '../utils/sendMail.js';
import jwt from 'jsonwebtoken';

//@desc Register a new user
//@route POST /api/users
//@access Public
const registerUser = asyncHandler(async (req, res) => {
  const {
    prenom,
    nom,
    cni,
    email,
    dateNaissance,
    mdp,
    dateObtentionBac,
    isAdmin,
    isController,
    isMaitreOuvrage,
  } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('Utilisateur existe deja');
  }
  const user = await User.create({
    prenom,
    nom,
    cni,
    email,
    dateNaissance,
    mdp,
    dateObtentionBac,
    isAdmin,
    isController,
    isMaitreOuvrage,
  });
  if (user) {
    res.status(201).json({
      _id: user._id,
      civilite: user.civilite,
      prenom: user.prenom,
      nom: user.nom,
      dateNaissance: user.dateNaissance,
      dateObtentionBac: user.dateObtentionBac,
      lieuNaissance: user.lieuNaissance,
      email: user.email,
      mdp: user.mdp,
      cni: user.cni,
      copieCNI: user.copieCNI,
      residence: user.residence,
      nationalite: user.nationalite,
      phone: user.phone,
      adresse: user.adresse,
      ville: user.ville,
      codePostale: user.codePostale,
      isAdmin: user.isAdmin,
      isController: user.isController,
      isMaitreOuvrage: user.isMaitreOuvrage,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Donnees invalides');
  }
});

//@Desc Auth user and get token
//@Route POST /api/users/login
//@Access Private
const authUser = asyncHandler(async (req, res) => {
  const { email, mdp } = req.body;

  const user = await User.findOne({ email }).populate('entreprise');

  if (user && (await user.matchPassword(mdp))) {
    res.json({
      _id: user._id,
      civilite: user.civilite,
      prenom: user.prenom,
      nom: user.nom,
      dateNaissance: user.dateNaissance,
      dateObtentionBac: user.dateObtentionBac,
      lieuNaissance: user.lieuNaissance,
      email: user.email,
      cni: user.cni,
      copieCNI: user.copieCNI,
      residence: user.residence,
      nationalite: user.nationalite,
      phone: user.phone,
      adresse: user.adresse,
      ville: user.ville,
      codePostale: user.codePostale,
      isAdmin: user.isAdmin,
      isController: user.isController,
      isMaitreOuvrage: user.isMaitreOuvrage,
      entreprise: user.entreprise,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalide email ou mot de passe');
  }
});

//@Desc Get user profile
//@Route GET /api/users/profile
//@Access Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-mdp').populate('entreprise');
  if (user) {
    res.json({
      _id: user._id,
      civilite: user.civilite,
      prenom: user.prenom,
      nom: user.nom,
      dateNaissance: user.dateNaissance,
      dateObtentionBac: user.dateObtentionBac,
      lieuNaissance: user.lieuNaissance,
      email: user.email,
      cni: user.cni,
      copieCNI: user.copieCNI,
      residence: user.residence,
      nationalite: user.nationalite,
      phone: user.phone,
      adresse: user.adresse,
      ville: user.ville,
      codePostale: user.codePostale,
      scoreAge: user.scoreAge,
      isController: user.isController,
      isMaitreOuvrage: user.isMaitreOuvrage,
      isAdmin: user.isAdmin,
      entreprise: user.entreprise,
    });
  } else {
    res.status(400);
    throw new Error("Cet utilsateur n'exsite pas");
  }
});

//@desc Update user prfoile
//@route PUT /api/users/profile
//@access Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    // Validation dynamique des champs obligatoires
    const errors = {};
    const getVal = (field) => (req.body[field] !== undefined ? String(req.body[field]).trim() : (user[field] || ''));

    if (!getVal('civilite')) {
      errors.civilite = 'La civilité est obligatoire (Madame / Monsieur)';
    }
    if (!getVal('nom')) {
      errors.nom = 'Le nom de famille est obligatoire';
    }
    if (!getVal('prenom')) {
      errors.prenom = 'Le prénom est obligatoire';
    }
    if (!getVal('dateNaissance')) {
      errors.dateNaissance = 'La date de naissance est obligatoire';
    }
    if (!getVal('lieuNaissance')) {
      errors.lieuNaissance = 'Le lieu de naissance est obligatoire';
    }
    if (!getVal('cni')) {
      errors.cni = 'Le numéro de CNI est obligatoire';
    }
    if (!getVal('email')) {
      errors.email = "L'adresse email est obligatoire";
    }
    if (!getVal('adresse')) {
      errors.adresse = "L'adresse de résidence est obligatoire";
    }
    if (!getVal('ville')) {
      errors.ville = 'La ville de résidence est obligatoire';
    }

    const phoneVal = getVal('phone');
    if (!phoneVal) {
      errors.phone = 'Le numéro de téléphone est obligatoire';
    } else {
      const cleanPhone = phoneVal.replace(/\s+/g, '');
      if (!/^(?:(?:\+|00)212|0)[5-7]\d{8}$/.test(cleanPhone)) {
        errors.phone = 'Numéro de téléphone marocain invalide (ex: 0612345678)';
      }
    }

    const cpVal = getVal('codePostale');
    if (cpVal && !/^\d{5}$/.test(cpVal)) {
      errors.codePostale = 'Le code postal doit être composé exactement de 5 chiffres (ex: 20000)';
    }

    if (Object.keys(errors).length > 0) {
      res.status(400);
      return res.json({
        message: 'Veuillez renseigner tous les champs obligatoires marqués d’un astérisque (*)',
        errors,
      });
    }

    user.civilite = req.body.civilite || user.civilite;
    user.prenom = req.body.prenom || user.prenom;
    user.nom = req.body.nom || user.nom;
    user.dateNaissance = req.body.dateNaissance || user.dateNaissance;
    user.dateObtentionBac = req.body.dateObtentionBac || user.dateObtentionBac;
    user.lieuNaissance = req.body.lieuNaissance || user.lieuNaissance;
    user.email = req.body.email || user.email;
    user.cni = req.body.cni || user.cni;
    user.copieCNI = req.body.copieCNI || user.copieCNI;
    user.copieCNIVerso = req.body.copieCNIVerso || user.copieCNIVerso;
    user.residence = req.body.residence || user.residence;
    user.nationalite = req.body.nationalite || user.nationalite;
    user.phone = req.body.phone || user.phone;
    user.adresse = req.body.adresse || user.adresse;
    user.ville = req.body.ville || user.ville;
    user.codePostale = req.body.codePostale || user.codePostale;
    user.isAdmin = req.body.isAdmin || user.isAdmin;
    user.isController = req.body.isController || user.isController;
    user.isMaitreOuvrage = req.body.isMaitreOuvrage || user.isMaitreOuvrage;
    if (req.body.mdp) {
      user.mdp = req.body.mdp;
    }
    if (req.body.dateNaissance) {
      user.scoreAge = controleAge(req.body.dateNaissance);
    }
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      civilite: updatedUser.civilite,
      prenom: updatedUser.prenom,
      nom: updatedUser.nom,
      dateNaissance: updatedUser.dateNaissance,
      dateObtentionBac: updatedUser.dateObtentionBac,
      lieuNaissance: updatedUser.lieuNaissance,
      email: updatedUser.email,
      cni: updatedUser.cni,
      copieCNI: updatedUser.copieCNI,
      copieCNIVerso: updatedUser.copieCNIVerso,
      residence: updatedUser.residence,
      nationalite: updatedUser.nationalite,
      phone: updatedUser.phone,
      adresse: updatedUser.adresse,
      ville: updatedUser.ville,
      codePostale: updatedUser.codePostale,
      scoreAge: updatedUser.scoreAge,
      isAdmin: updatedUser.isAdmin,
      isController: updatedUser.isController,
      isMaitreOuvrage: updatedUser.isMaitreOuvrage,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(400);
    throw new Error('User not found');
  }
});

//@desc Get All users
//@route GET /api/users
//@access Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});

  res.json(users);
});

//@desc Get user by Id
//@route GET /api/users/:id
//@access Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-mdp');
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User Not found');
  }
});

//@desc Update user
//@route PUT /api/users/:id
//@access Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.civilite = req.body.civilite || user.civilite;
    user.prenom = req.body.prenom || user.prenom;
    user.nom = req.body.nom || user.nom;
    user.dateNaissance = req.body.dateNaissance || user.dateNaissance;
    user.dateObtentionBac = req.body.dateObtentionBac || user.dateObtentionBac;
    user.lieuNaissance = req.body.lieuNaissance || user.lieuNaissance;
    user.email = req.body.email || user.email;
    user.cni = req.body.cni || user.cni;
    user.copieCNI = req.body.copieCNI || user.copieCNI;
    user.copieCNIVerso = req.body.copieCNIVerso || user.copieCNIVerso;
    user.residence = req.body.residence || user.residence;
    user.nationalite = req.body.nationalite || user.nationalite;
    user.phone = req.body.phone || user.phone;
    user.adresse = req.body.adresse || user.adresse;
    user.ville = req.body.ville || user.ville;
    user.codePostale = req.body.codePostale || user.codePostale;
    user.isAdmin = req.body.isAdmin || user.isAdmin;
    user.isController = req.body.isController || user.isController;
    user.isMaitreOuvrage = req.body.isMaitreOuvrage || user.isMaitreOuvrage;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      civilite: updatedUser.civilite,
      prenom: updatedUser.prenom,
      nom: updatedUser.nom,
      dateNaissance: updatedUser.dateNaissance,
      dateObtentionBac: updatedUser.dateObtentionBac,
      lieuNaissance: updatedUser.lieuNaissance,
      email: updatedUser.email,
      cni: updatedUser.cni,
      copieCNI: updatedUser.copieCNI,
      copieCNIVerso: updatedUser.copieCNIVerso,
      residence: updatedUser.residence,
      nationalite: updatedUser.nationalite,
      phone: updatedUser.phone,
      adresse: updatedUser.adresse,
      ville: updatedUser.ville,
      codePostale: updatedUser.codePostale,
      scoreAge: updatedUser.scoreAge,
      isAdmin: updatedUser.isAdmin,
      isController: updatedUser.isController,
      isMaitreOuvrage: updatedUser.isMaitreOuvrage,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc      Forgot password
// @route     POST /api/v1/auth/forgotpassword
// @access    Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  try {
    if (!user) {
      return next(new Error('There is no user with that email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    // Create reset url
    const resetUrl = `${req.protocol}://localhost:5002/api/users/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    await sendEmail(
      user.email,
      'iliassanatii@gmail.com',
      'Best To Do password reset',
      `
      <div>Click the link below to reset your password</div><br/>
      <div>${message}</div>
      `
    );

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return next(new Error('Email could not be sent'));
  }
});

// @desc      Reset password
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    Public
const resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token

  // const token = req.params.resetToken;
  const resetPasswordToken = req.params.resetToken;

  console.log(resetPasswordToken);

  const user = await User.findOne({
    resetPasswordToken,
  });

  if (!user) {
    return next(new Error('Invalid token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({
    _id: user._id,
    civilite: user.civilite,
    prenom: user.prenom,
    nom: user.nom,
    dateNaissance: user.dateNaissance,
    dateObtentionBac: user.dateObtentionBac,
    lieuNaissance: user.lieuNaissance,
    email: user.email,
    mdp: user.mdp,
    cni: user.cni,
    copieCNI: user.copieCNI,
    residence: user.residence,
    nationalite: user.nationalite,
    phone: user.phone,
    adresse: user.adresse,
    ville: user.ville,
    codePostale: user.codePostale,
    isAdmin: user.isAdmin,
    isController: user.isController,
    isMaitreOuvrage: user.isMaitreOuvrage,
  });
});

export {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  updateUser,
  forgotPassword,
  resetPassword,
};
