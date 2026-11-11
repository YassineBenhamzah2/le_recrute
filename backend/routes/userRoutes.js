import express from 'express';
import {
  authUser,
  getUserProfile,
  getUsers,
  registerUser,
  updateUser,
  updateUserProfile,
} from '../controllers/userControllers.js';

import { admin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, admin, getUsers);

router.route('/register').post(registerUser);

router.route('/login').post(authUser);

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route('/:id').put(protect, updateUser);

// router.route('/forgotpassword').post(forgotPassword);
// router.put('/resetpassword/:resetToken', resetPassword);

export default router;
